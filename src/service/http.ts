const [n, s, ip, port, user, pass, interval] = process.argv;
import axios, { AxiosError } from "axios";
import { message } from "../typing/message";
import { log } from "../mics/debug";
import https from "https";
if (isNaN(parseInt(interval))) {
    process.exit(0);
}

process.on("message", (message) => {
    if (!process.send) return;
    if (message == "heartbeat") return process.send("heartbeat");
});
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getServiceWithoutSSL() {
    try {
        let req;
        if (user != "null") {
            req = await axios.get(`http://${user}:${pass}@${ip}:${port}`, { httpsAgent: httpsAgent });
        } else req = await axios.get(`http://${user}:${pass}@${ip}:${port}`, { httpsAgent: httpsAgent });
        return req.status;
    } catch (error) {
        return false;
    }
}

async function pingService() {
    try {
        let req;
        if (user != "null") {
            req = await axios.get(`http://${user}:${pass}@${ip}:${port}`);
        } else req = await axios.get(`http://${user}:${pass}@${ip}:${port}`);
        sendMessage(false, req.status.toString());
    } catch (error) {
        const err = error as AxiosError;
        if (err.request) {
            if (err.message.includes("unable to verify")) {
                let result = await getServiceWithoutSSL();
                if (!result) sendMessage(true, err.message);
                else sendMessage(false, result + " " + err.message);
                return;
            }

            sendMessage(true, err.message);
        } else log(`Process HTTP ${ip}:${port}` + err.message, "error");
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
pingService();
setInterval(pingService, parseInt(interval) * 60 * 60);
