import { Embed, EmbedBuilder, WebhookClient } from "discord.js";
import config from "../config.json";
import { service } from "./typing/service";

const hook = new WebhookClient({ url: config.webhook });

async function sendFailure(server: service, serviceMessage: string) {
    const embed = new EmbedBuilder()
        .setTitle(`${server.protocol.toUpperCase()} ${server.name} ${server.ip} ${server.port} Failed`)
        .setDescription(server.fail_message)
        .setColor(0xff0033)
        .addFields({ name: "Service Message", value: serviceMessage })
        .setTimestamp();

    await sendEmbed(embed);
}

async function sendEmbed(embed: EmbedBuilder) {
    await hook.send({
        username: "ServicesUp",
        embeds: [embed],
    });
}
async function sendSuccess(server: service, serviceMessage: string) {
    if (!server.success_message) return;
    const embed = new EmbedBuilder()
        .setTitle(`${server.protocol.toUpperCase()} ${server.name} ${server.ip} ${server.port} Succeeded`)
        .setDescription(server.success_message)
        .setColor(0x00ff33)
        .addFields({ name: "Service Message", value: serviceMessage })
        .setTimestamp();

    await sendEmbed(embed);
}

export { sendFailure, sendSuccess };
