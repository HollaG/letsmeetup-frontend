import { Box, Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

/**
 * The overall layout container for the website.
 * @returns Layout
 */
const Layout = () => {
    return (
        <Container maxWidth={"lg"} mt={3} minHeight={"1500px"}>
            <Outlet />
        </Container>
    );
};

export default Layout;
