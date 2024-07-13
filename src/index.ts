import config from "../config.json";
import { log } from "./mics/debug";
import { Service } from "./service";
import express from "express";
log("Starting service check!");

let services: Service[] = [];
for (let i = 0; i < config.server.length; i++) {
    const service = config.server[i];
    let s = new Service(service);
    services.push(s);
}

async function check() {
    for (let i = 0; i < services.length; i++) {
        const s = services[i];
        let m = s.getInfo();
        log(m, "info");
    }
}

setInterval(check, 60 * 1000);

let app = express();

app.use("/status", (req, res) => {
    let html = `
    <table>
        <tr>
            <th>Success</th>
            <th>Fails</th>
            <th>Last Ping</th>
            <th>Last Success Ping</th>
            <th>Pings</th>
            <th>Interval</th>
            <th>IP</th>
            <th>Port</th>
            <th>Protocol</th>
        </tr>
`;

    services.forEach((service) => {
        let item = service.toJSON();
        html += `
        <tr>
            <td>${item.success}</td>
            <td>${item.fails}</td>
            <td>${item.lastPing}</td>
            <td>${item.lastSuccessPing}</td>
            <td>${item.pings}</td>
            <td>${item.interval}</td>
            <td>${item.ip}</td>
            <td>${item.port}</td>
            <td>${item.protocol}</td>
        </tr>
    `;
    });

    html += "</table>";

    res.send(html);
});

app.listen(3000, function () {
    log("App is listening on port 3000!");
});
