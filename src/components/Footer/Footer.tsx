import {
    Divider,
    Flex,
    Grid,
    GridItem,
    HStack,
    SimpleGrid,
    Link as NavLink,
    Icon,
    Text,
    useColorModeValue,
    Center,
    Stack,
    useMediaQuery,
} from "@chakra-ui/react";
import {
    FaBasketballBall,
    FaGithub,
    FaInternetExplorer,
    FaLinkedin,
} from "react-icons/fa";

import { Link } from "react-router-dom";

const Footer = () => {
    const textColor = useColorModeValue("gray.600", "gray.300");

    const [showBigFooter] = useMediaQuery("(min-width: 48em)");
    const BigFooter = (
        <Grid
            gridTemplateColumns="1fr 10px 1fr"
            height="48px"
            alignItems="center"
            gap={{ base: 2, md: 7 }}
            textColor={textColor}
            px={2}
            textAlign="center"
            pb={1}
            fontSize="sm"
            fontFamily="Zilla Slab"
        >
            <GridItem>
                <Flex justifyContent={"right"} alignItems="center">
                    <HStack spacing={{ base: 2, md: 6 }}>
                        <NavLink as={Link} to="/about">
                            About
                        </NavLink>
                        <NavLink as={Link} to="/policies/privacy">
                            {" "}
                            Privacy Policy{" "}
                        </NavLink>
                        <NavLink as={Link} to="/policies/terms">
                            {" "}
                            Terms & Conditions{" "}
                        </NavLink>
                    </HStack>
                </Flex>
            </GridItem>
            <GridItem textAlign={"center"} alignItems="center">
                {/* <Divider orientation="vertical" /> */}|
            </GridItem>
            <GridItem>
                <Flex justifyContent={"left"} alignItems="center">
                    <HStack spacing={{ base: 2, md: 6 }}>
                        <NavLink isExternal href="https://marcussoh.com">
                            by Marcus Soh (2023)
                        </NavLink>
                        <NavLink isExternal href="https://github.com/HollaG">
                            <Center>
                                <Icon as={FaGithub} />
                            </Center>
                        </NavLink>
                        <NavLink
                            isExternal
                            href="https://www.linkedin.com/in/marcussoh1/"
                        >
                            <Center>
                                <Icon as={FaLinkedin} />
                            </Center>
                        </NavLink>
                    </HStack>
                </Flex>
            </GridItem>
        </Grid>
    );
    if (showBigFooter) return BigFooter;
    return (
        <Stack
            p={6}
            spacing={6}
            fontSize="sm"
            textColor={textColor}
            fontFamily="Zilla Slab"
        >
            <Divider />

            <Stack spacing={2}>
                <NavLink as={Link} to="/about">
                    About
                </NavLink>
                <NavLink as={Link} to="/policies/privacy">
                    {" "}
                    Privacy Policy{" "}
                </NavLink>
                <NavLink as={Link} to="/policies/terms">
                    {" "}
                    Terms & Conditions{" "}
                </NavLink>
            </Stack>
            <HStack spacing={2}>
                <NavLink isExternal href="https://marcussoh.com">
                    by Marcus Soh (2023)
                </NavLink>
                <NavLink isExternal href="https://github.com/HollaG">
                    <Center>
                        <Icon as={FaGithub} />
                    </Center>
                </NavLink>
                <NavLink
                    isExternal
                    href="https://www.linkedin.com/in/marcussoh1/"
                >
                    <Center>
                        <Icon as={FaLinkedin} />
                    </Center>
                </NavLink>
            </HStack>
        </Stack>
    );
};

export default Footer;
