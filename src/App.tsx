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

import * as meetups from "./db/repositories/meetups";
import { useEffect } from "react";

import {
    MainButton,
    useScanQrPopup,
    useShowPopup,
} from "@vkruglikov/react-telegram-web-app";
import { useState } from "react";
import { useTelegram } from "./context/TelegramProvider";

export const App = () => {
    useEffect(() => {
        fetchMeetups();
    }, []);

    const fetchMeetups = async () => {
        // clean the todos array first
        // setTodos([]);
        // fetch todos from repository
        const _meetups = await meetups.all();
        // console.log(_meetups);
        // set todos to state
        // setTodos(_todos);
    };

    const { user, webApp } = useTelegram();
    console.log({ user, webApp });

    useEffect(() => {}, []);

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
