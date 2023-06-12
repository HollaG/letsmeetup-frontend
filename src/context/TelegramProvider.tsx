import { useColorMode } from "@chakra-ui/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { IMeetupUser } from "../firebase/db/repositories/users";
import type { IWebApp, ThemeParams } from "../types/telegram";

export interface ITelegramContext {
    webApp?: IWebApp;
    user?: IMeetupUser;
    style?: ThemeParams;
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
    const { colorMode, toggleColorMode, setColorMode } = useColorMode();

    const [themeParams, setThemeParams] = useState<ThemeParams | null>(null);
    const updateColorMode = () => {
        const newStyle = ((window as any).Telegram.WebApp as IWebApp)
            .themeParams;

        // check if it's dark or light mode
        const htmlElement = document.getElementsByTagName("html")[0];

        // @ts-ignore
        const attr = htmlElement.attributes.style.textContent;

        const newAttrArr: string[] = attr
            .replaceAll("--", "")
            .replaceAll(" ", "")
            .trim()
            .split(";");

        const isDarkMode = newAttrArr.some((attr) =>
            attr.includes("tg-color-scheme:dark")
        );

        if (isDarkMode) {
            setColorMode("dark");
        } else {
            setColorMode("light");
        }

        setThemeParams({ ...newStyle });
        document.body.style.background = newStyle.bg_color;
    };

    // Update the color mode if it changes
    useEffect(() => {
        const app = (window as any).Telegram?.WebApp;

        if (app as IWebApp) {
            const initData = app.initData;

            if (initData) {
                updateColorMode();
            }
        }
    }, [(window as any).Telegram?.WebApp]);

    const app = (window as any).Telegram?.WebApp;

    if (app as IWebApp) {
        const initData = app.initData;

        if (initData) {
            // There's no need to validate data, we're not dealing with sensitive information.
            // validateHash(initData)
            //     .then(() => {
            //         console.log("Data validated, you're good to go!");
            //         app.ready();
            //     })
            //     .catch((e) => {
            //         app = null;
            //     });
            app.ready();
            app.onEvent("themeChanged", updateColorMode);
        }
    }

    const [webApp, setWebApp] = useState<IWebApp | null>(app);

    const value = useMemo(() => {
        return webApp
            ? {
                  webApp,
                  unsafeData: webApp.initDataUnsafe,
                  user: webApp.initDataUnsafe.user
                      ? { ...webApp.initDataUnsafe.user, type: "telegram" }
                      : undefined,
                  style: themeParams || undefined,
              }
            : {};
    }, [webApp, themeParams]);

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
