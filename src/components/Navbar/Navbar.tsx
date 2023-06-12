import { ReactNode } from "react";
import {
    Box,
    Flex,
    Avatar,
    Link as NavLink,
    Button,
    useDisclosure,
    useColorModeValue,
    Stack,
    useColorMode,
    Center,
    Container,
    Image,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
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

    return (
        <Box
            bg={useColorModeValue("purple.50", "gray.900")}
            boxShadow="rgba(0, 0, 0, 0.1) 0px 4px 13px -3px"
            // borderBottom={'1px solid rgb(210, 210, 210)'}
            px={4}
        >
            <Container maxWidth="1000px">
                <Flex
                    h={16}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                >
                    <NavLink as={Link} to="/">
                        <Flex
                            alignItems={"center"}
                            // background="radial-gradient(circle, rgba(255,87,87,0.25) 0%, rgba(140,82,255,0.25) 100%)"
                            // py={2}
                            // px={3}
                            // borderRadius="50%"
                            // textColor={"white"}
                            fontSize="xl"
                            // fontWeight={"semiblod"}
                            fontFamily="Zilla Slab"
                        >
                            <Image
                                src={"/logo192.png"}
                                width="36px"
                                height="36px"
                            />{" "}
                            Look4Times
                        </Flex>
                    </NavLink>

                    <Flex alignItems={"center"}>
                        <Stack direction={"row"} spacing={5}>
                            <Button onClick={toggleColorMode} variant="ghost">
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
                                        colorScheme="purple"
                                        variant="ghost"
                                        fontFamily="Zilla Slab"
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
