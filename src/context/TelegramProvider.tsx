import { useColorMode } from "@chakra-ui/react";
import { ThemeProvider } from "@emotion/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ITelegramUser, IWebApp } from "../types/telegram";

export interface ITelegramContext {
    webApp?: IWebApp;
    user?: ITelegramUser;
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

type ThemeParams = {
    "color-scheme"?: string;
    "tg-color-scheme"?: string;
    "tg-theme-bg-color"?: string;
    "tg-theme-button-color"?: string;
    "tg-theme-button-text-color"?: string;
    "tg-theme-hint-color"?: string;
    "tg-theme-link-color"?: string;
    "tg-theme-secondary-bg-color"?: string;
    "tg-theme-text-color"?: string;
    "tg-viewport-height"?: string;
    "tg-viewport-stable-height"?: string;
};

const compareWithPrevious = (prev: ThemeParams, next: ThemeParams) => {
    const prevStr = JSON.stringify(prev);
    const nextStr = JSON.stringify(next);
    return prevStr === nextStr;
};

export const TelegramProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [webApp, setWebApp] = useState<IWebApp | null>(null);

    const { colorMode, toggleColorMode, setColorMode } = useColorMode();

    const updateColorMode = () => {
        const newStyle = ((window as any).Telegram.WebApp as IWebApp)
            .themeParams;

        // check if it's dark or light mode
        console.log({ newStyle, this: this });
        const htmlElement = document.getElementsByTagName("html")[0];

        console.log(htmlElement);
        // @ts-ignore
        const attr = htmlElement.attributes.style.textContent;
        console.log(attr);
        const newAttrArr: string[] = attr
            .replaceAll("--", "")
            .replaceAll(" ", "")
            .trim()
            .split(";");
        console.log({ newAttrArr });
        const isDarkMode = newAttrArr.some((attr) =>
            attr.includes("tg-color-scheme:dark")
        );

        console.log({ isDarkMode });
        if (isDarkMode) {
            setColorMode("dark");
        } else {
            setColorMode("light");
        }
    };

    useEffect(() => {
        console.log("this useeffect run");
        const app = (window as any).Telegram?.WebApp;

        if (app as IWebApp) {
            const initData = app.initData;

            if (initData) {
                validateHash(initData).then(() => {
                    console.log("Data validated, you're good to go!");
                    app.ready();
                    setWebApp(app);
                });
                app.onEvent("themeChanged", updateColorMode);
                updateColorMode();
            }
        }
    }, [(window as any).Telegram?.WebApp]);

    /**
     * Handle synchronising color mode to Telegram
     *
     * 1) telegram updates the theme by modifying the head element
     * 2) Chakra also updates the theme by modifying the head element. Note that it also has a variable theme (for e.g.) to get the theme which is 'dark' or 'light'
     * 3) idea: listen to when the head element is updated as that will tell us when Telegram updated the theme, and then we can toggle the UI library theme. We create a listener by attaching a function that will run whenever the head changes
     * 4) problem: toggling the UI library theme causes the head element to be updated, which then causes #3 to run, which causes an infinite loop
     * 5) solution: after we receive a head update from Telegram, we update the UI library's theme If it is different, then STOP listetning to head updates.
     * 6) after the listener to the head element has finished calling the function that is attached, since we stopped listening, it will no longer listen
     * 7) Then, UI library updates the head and updates the variable theme.
     * 8) We have another listener for the variable theme, that when it sees theme being updated, it basically runs step 3 again, so skipping the update to head that the ui library causes
     */
    const [style, setStyle] = useState<ThemeParams | null>(null);
    const [prevAttrString, setPrevAttrString] = useState<string>("");
    // useEffect(() => {
    //     const htmlElement = document.getElementsByTagName("html")[0];
    //     const observer = new MutationObserver((mutations) => {
    //         mutations.forEach((mutation) => {
    //             if (mutation.type === "attributes") {
    //                 const newAttr: string = // @ts-ignore
    //                     (mutation.target as Element).attributes.style
    //                         .textContent;

    //                 const newObj: ThemeParams = {};
    //                 const newAttrArr = newAttr
    //                     .replaceAll("--", "")
    //                     .replaceAll(" ", "")
    //                     .trim()
    //                     .split(";");
    //                 newAttrArr.forEach((item) => {
    //                     const [name, style] = item.split(":");
    //                     if (name) {
    //                         // Ignore these two attributes, as they cause unnecessary updates when resizing.
    //                         if (
    //                             name === "tg-viewport-height" ||
    //                             name === "tg-viewport-stable-height"
    //                         ) {
    //                         } else {
    //                             newObj[name as keyof ThemeParams] = style;
    //                         }
    //                     }
    //                 });

    //                 if (compareWithPrevious(style || {}, newObj)) {
    //                     console.log(
    //                         "Prevented updates as style was the same as previous."
    //                     );
    //                     return;
    //                 }
    //                 setStyle(newObj);
    //                 // console.log({ colorMode });
    //                 if (newObj["tg-theme-bg-color"]) {
    //                     document.body.style.background =
    //                         newObj["tg-theme-bg-color"];
    //                 }

    //                 if (colorMode === newObj["tg-color-scheme"]) {
    //                     return;
    //                 } else if (newObj["tg-color-scheme"]) {
    //                     setColorMode(newObj["tg-color-scheme"]);

    //                     observer.disconnect();
    //                 }
    //             }
    //         });
    //     });

    //     observer.observe(htmlElement, { attributes: true, subtree: false });

    //     return () => observer.disconnect();
    // }, [colorMode]);

    const value = useMemo(() => {
        return webApp
            ? {
                  webApp,
                  unsafeData: webApp.initDataUnsafe,
                  user: webApp.initDataUnsafe.user,
                  style: style || {},
              }
            : {};
    }, [webApp, style]);

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
