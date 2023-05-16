import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ITelegramUser, IWebApp } from "../types/telegram";

export interface ITelegramContext {
    webApp?: IWebApp;
    user?: ITelegramUser;
}

export const TelegramContext = createContext<ITelegramContext>({});

function transformInitData(initData: string) {
    return Object.fromEntries(new URLSearchParams(initData));
}
async function validate(data: any, botToken: string) {
    const encoder = new TextEncoder();
    const checkString = await Object.keys(data)
        .filter((key) => key !== "hash")
        .map((key) => `${key}=${data[key]}`)
        .sort()
        .join("\n");
    const secretKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode("WebAppData"),
        { name: "HMAC", hash: "SHA-256" },
        true,
        ["sign"]
    );
    const secret = await crypto.subtle.sign(
        "HMAC",
        secretKey,
        encoder.encode(botToken)
    );
    const signatureKey = await crypto.subtle.importKey(
        "raw",
        secret,
        { name: "HMAC", hash: "SHA-256" },
        true,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        signatureKey,
        encoder.encode(checkString)
    );
    const hex = [...new Uint8Array(signature)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return data.hash === hex;
}
async function validateHash(initData: string): Promise<boolean> {
    return await validate(
        transformInitData(initData),
        process.env.REACT_APP_BOT_TOKEN || ""
    );
}

export const TelegramProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [webApp, setWebApp] = useState<IWebApp | null>(null);

    useEffect(() => {
        const app = (window as any).Telegram?.WebApp;

        console.log(app, "---");
        if (app) {
            const initData = app.initData;

            if (initData) {
                validateHash(initData).then(() => {
                    console.log("Data validated, you're good to go!");
                    app.ready();
                    setWebApp(app);
                });
            }
        }
    }, [(window as any).Telegram?.WebApp]);

    const value = useMemo(() => {
        return webApp
            ? {
                  webApp,
                  unsafeData: webApp.initDataUnsafe,
                  user: webApp.initDataUnsafe.user,
              }
            : {};
    }, [webApp]);

    return (
        <TelegramContext.Provider value={value}>
            {/* Make sure to include script tag with "beforeInteractive" strategy to pre-load web-app script */}
            {/* <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />       */}
            {children}
        </TelegramContext.Provider>
    );
};

export const useTelegram = () => useContext(TelegramContext);

export {};
