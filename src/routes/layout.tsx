import { Box, Container } from "@chakra-ui/react";
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Nav from "../components/Navbar/Navbar";
import ScrollToTop from "../components/Utility/ScrollToTop";
import { useTelegram } from "../context/TelegramProvider";

/**
 * The overall layout container for the website.
 * @returns Layout
 */
const Layout = ({
    children,
}: {
    children?: React.ReactNode | React.ReactNode[];
}) => {
    // Only display navbar if user doesn't use Telegram webapp functionality
    const { user } = useTelegram();
    // console.log(webApp);
    return (
        <>
            <ScrollToTop />
            <Box minHeight={"1500px"} pb={10}>
                {!user && <Nav />}
                <Container mt={3} maxW="1000px">
                    {children ?? <Outlet />}
                </Container>
            </Box>
            <Footer />
        </>
    );
};

export default Layout;
