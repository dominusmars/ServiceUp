import pkg from "colors";
const { bold } = pkg;
type t = "log" | "debug" | "warn" | "error" | "info" | "success";

var log = (message: string, type: t = "debug") => {
    const now = new Date();
    const timestamp = now.toISOString(); // Get the current timestamp in ISO format

    let t;
    switch (type.toLowerCase()) {
        default:
        case "log":
            t = "[LOG] ".blue;
            break;
        case "debug":
            t = "[DEBUG] ".green;
            break;
        case "warn":
            t = "[WARNING] ".yellow;
            break;
        case "error":
            t = "[ERROR] ".red;
            break;
        case "info":
            t = "[MESSAGE] ".magenta;
            break;
        case "success":
            t = bold("[SUCCESS]".green);
            break;
    }

    console.log(`${timestamp} ${t}`, message);
};
var error = (message: string) => {
    console.log("[ERROR] ".red, message);
};
var success = (message: string) => {
    console.log(bold("[SUCCESS]".green), message);
};
var info = (message: string) => {
    console.log("[MESSAGE] ".magenta, message);
};

export { log, error, success, info };
