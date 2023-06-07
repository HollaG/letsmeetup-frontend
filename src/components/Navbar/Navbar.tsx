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

export default function Nav() {
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const webUser = useWebUser();
    const { user } = useTelegram();
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
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        rounded={"full"}
                                        variant={"link"}
                                        cursor={"pointer"}
                                        minW={0}
                                    >
                                        <Avatar
                                            size={"sm"}
                                            src={
                                                "https://avatars.dicebear.com/api/male/username.svg"
                                            }
                                        />
                                    </MenuButton>
                                    <MenuList alignItems={"center"}>
                                        <br />
                                        <Center>
                                            <Avatar
                                                size={"2xl"}
                                                src={
                                                    "https://avatars.dicebear.com/api/male/username.svg"
                                                }
                                            />
                                        </Center>
                                        <br />
                                        <Center>
                                            <p>
                                                {webUser && webUser.first_name}
                                            </p>
                                        </Center>
                                        <br />
                                        <MenuDivider />
                                        <MenuItem>Your Servers</MenuItem>
                                        <MenuItem>Account Settings</MenuItem>
                                        <MenuItem
                                            onClick={signOutWithoutUsername}
                                        >
                                            Logout
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            )}
                            {!(webUser || user) && <Button> Sign in</Button>}
                        </Stack>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
}
