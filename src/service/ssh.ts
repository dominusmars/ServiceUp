const [n, s, ip, port, user, pass, interval] = process.argv;
import axios, { AxiosError } from "axios";
import { message } from "../typing/message";
import { log } from "../mics/debug";
import SSH2Promise from "ssh2-promise";
import SSHConfig from "ssh2-promise/lib/sshConfig";

if (isNaN(parseInt(interval))) {
    process.exit(0);
}

process.on("message", (message) => {
    if (!process.send) return;
    if (message == "heartbeat") return process.send("heartbeat");
});

const timeout = 10000;

async function connectSSH() {
    const config: SSHConfig = {
        host: ip,
        port: isNaN(parseInt(port)) ? 22 : parseInt(port),
        username: user,
        password: pass,
        authHandler: ["password"],
        readyTimeout: timeout,
        reconnectTries: 3,
    };
    const s = new SSH2Promise(config, true);

    try {
        await s.connect();
        let res = await s.exec("hostname");
        if (res.length > 0) return true;
    } catch (error) {
        throw error;
    } finally {
        s.close();
    }
}

async function pingService() {
    try {
        await connectSSH();
        sendMessage(false, "connected");
    } catch (error) {
        const err = error as Error;
        console.log(typeof error);
        if (err.message) {
            sendMessage(true, err.message.toString());
        } else log(`Process SSH ${ip}:${port}` + err.message, "error");
    }
}

function sendMessage(failed: boolean, info: string) {
    const m: message = {
        fail: failed,
        status: info,
    };
    if (!process.send) return;
    process.send(m);
}
setInterval(pingService, parseInt(interval) * 60 * 60);
