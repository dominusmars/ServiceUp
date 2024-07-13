import { service } from "./typing/service";
import { fork, ChildProcess } from "node:child_process";
import path from "path";
import { message } from "./typing/message";
import { sendFailure, sendSuccess } from "./serviceInfo";
import fs from "fs";
export class Service {
    info: service;
    interval: number;
    pings: number;
    child: ChildProcess;
    lastSuccessPing: Date;
    lastPing: Date;
    success: number;
    failures: number;
    live: boolean;
    constructor(service: service, interval: number = 60) {
        this.info = service;
        this.interval = interval;
        this.pings = 0;
        this.failures = 0;
        this.success = 0;
        this.lastPing = new Date(0);
        this.lastSuccessPing = new Date(0);
        this.live = false;
        const childPath = path.parse(this.info.protocol.toLocaleLowerCase()).base;
        const args = [this.info.ip, this.info.port, this.info.user || "null", this.info.password || "null", interval.toString()];
        this.child = fork(findModule(childPath), args);
        this.child.on("message", (m) => {
            if (typeof m == "string") {
                if (m == "heartbeat") this.live = true;
                return;
            }
            const child_mess = m as message;
            if (child_mess.fail) {
                this.failures++;
                sendFailure(this.info, child_mess.status);
            }
            if (child_mess.fail == false) {
                this.success++;
                this.lastSuccessPing = new Date();
                sendSuccess(this.info, child_mess.status);
            }
            this.lastPing = new Date();
            this.pings++;
        });
        this.child.send("heartbeat");
    }
    getInfo() {
        const m = `${this.info.protocol.toUpperCase()} ${
            this.info.ip
        } Last Ping: ${this.lastPing.toISOString()} Last Success: ${this.lastSuccessPing.toISOString()} Pings: ${this.pings} `;
        return m;
    }
    toJSON() {
        return {
            success: this.success,
            fails: this.failures,
            lastPing: this.lastPing.toISOString(),
            lastSuccessPing: this.lastSuccessPing.toISOString(),
            pings: this.pings,
            interval: this.interval,
            ip: this.info.ip,
            port: this.info.port,
            protocol: this.info.protocol.toLocaleLowerCase(),
        };
    }
}
function findModule(protocol: string) {
    const servicesDir = path.resolve(__dirname, "./service/");
    let files = fs.readdirSync(servicesDir);
    let fileName = files.find((v) => v.includes(protocol.toLowerCase()));
    if (!fileName) throw new Error("Unable to find protocol " + protocol);
    return path.resolve(servicesDir, fileName);
}
