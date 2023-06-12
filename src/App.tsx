import * as React from "react";
import {
    ChakraProvider,
    theme,
} from "@chakra-ui/react";





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
