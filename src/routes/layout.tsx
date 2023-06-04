import { Box, Center, Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Nav from "../components/Navbar/Navbar";
import { useTelegram } from "../context/TelegramProvider";

/**
 * The overall layout container for the website.
 * @returns Layout
 */
const Layout = () => {
    // Only display navbar if user doesn't use Telegram webapp functionality
    const { user } = useTelegram();
    console.log(user);
    return (
        <Box minHeight={"1500px"} pb={6}>
            {!user && <Nav />}
            <Container mt={3} maxW="1000px">
                <Outlet />
            </Container>
        </Box>
    );
};

export default Layout;
