export type service = {
    protocol: "Http" | "Ssh" | string;
    success_message: string | null | undefined;
    fail_message: string;
    name: string;
    ip: string;
    port: string;
    user?: string | null | undefined;
    password?: string | null | undefined;
};
