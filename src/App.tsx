import * as React from "react";
import {
    ChakraProvider,
    Box,
    Text,
    Link,
    VStack,
    Code,
    Grid,
    theme,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

import * as meetups from "./firebase/db/repositories/meetups";
import { useEffect } from "react";

import {
    MainButton,
    useScanQrPopup,
    useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useState } from "react";
import { useTelegram } from "./context/TelegramProvider";

export const App = () => {
    return (
        <ChakraProvider theme={theme}>
            {/* <MainButton
                text="SHOW POPUP"
                onClick={() => {
                    showPopup({
                        message: "Hello, I'am showPopup handle",
                    });
                }}
            /> */}
        </ChakraProvider>
    );
};
