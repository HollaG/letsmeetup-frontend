import { ReactNode } from "react";
import {
    Box,
    Flex,
    Avatar,
    Link as NavLink,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    Stack,
    useColorMode,
    Center,
    Container,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { signOut } from "firebase/auth";
import { signOutWithoutUsername } from "../../firebase/auth/anonymous";
import { useWebUser } from "../../context/WebAuthProvider";
import { useTelegram } from "../../context/TelegramProvider";

import { Link } from "react-router-dom";

const MenuNavLink = ({ children }: { children: ReactNode }) => (
    <NavLink
        px={2}
        py={1}
        rounded={"md"}
        _hover={{
            textDecoration: "none",
            bg: useColorModeValue("gray.200", "gray.700"),
        }}
        href={"#"}
    >
        {children}
    </NavLink>
);

/**
 * Component only renders when the user is NOT visiting from Telegram.
 * This means that `user` will always be null
 *
 * @returns Navbar
 */
export default function Nav() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const webUser = useWebUser();
    const { user } = useTelegram();

    console.log({ webUser });
    return (
        <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
            <Container maxWidth="1000px">
                <Flex
                    h={16}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                >
                    <NavLink as={Link} to="/">
                        📅 MeetUp
                    </NavLink>

                    <Flex alignItems={"center"}>
                        <Stack direction={"row"} spacing={7}>
                            <Button onClick={toggleColorMode}>
                                {colorMode === "light" ? (
                                    <MoonIcon />
                                ) : (
                                    <SunIcon />
                                )}
                            </Button>

                            {(webUser || user) && (
                                <Center>
                                    <NavLink as={Link} to="/meetups">
                                        <Avatar
                                            size={"sm"}
                                            src={
                                                webUser
                                                    ? webUser.photo_url
                                                    : user?.photo_url
                                            }
                                            name={
                                                webUser
                                                    ? webUser.first_name
                                                    : user?.first_name
                                            }
                                        />
                                    </NavLink>
                                </Center>
                            )}

                            {!(webUser || user) && (
                                <NavLink as={Link} to="/auth">
                                    <Button
                                        isLoading={webUser === false}
                                        colorScheme="blue"
                                    >
                                        {" "}
                                        Sign in
                                    </Button>{" "}
                                </NavLink>
                            )}
                        </Stack>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
}
