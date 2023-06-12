import {
    Button,
    Center,
    Heading,
    Stack,
    Text,
    Link as NavLink,
    SimpleGrid,
    Image,
    Box,
    useMediaQuery,
    Divider,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import CallToActionWithIllustration from "../components/CTA/CTA";
import SimpleThreeColumns from "../components/CTA/Features";
import { Link } from "react-router-dom";
const Root = () => {
    const featuresRef = useRef<HTMLDivElement>(null);
    const [showSecondIllustration] = useMediaQuery("(min-width: 48em)");
    useEffect(() => {
        document.title = `Look4Times`;
    }, []);
    return (
        <Stack spacing={12}>
            <CallToActionWithIllustration featuresRef={featuresRef} />
            <Stack>
                <Heading
                    textAlign="center"
                    fontSize={{ base: "4xl", md: "6xl" }}
                >
                    Features 🙌
                </Heading>
                <SimpleThreeColumns featuresRef={featuresRef} />
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 2 }}>
                <Center>
                    <Stack>
                        <Heading fontSize={"3xl"}>
                            {" "}
                            Have more questions? 🤔
                        </Heading>
                        <Box textAlign={{ base: "center", md: "unset" }}>
                            <Button
                                as={Link}
                                to="/about"
                                variant="ghost"
                                fontFamily="Zilla Slab"
                            >
                                {" "}
                                Check out the About page ⟶{" "}
                            </Button>
                        </Box>
                    </Stack>
                </Center>
                {showSecondIllustration && (
                    <Center>
                        <Image src="/images/homepage3.svg" maxW="350px" />
                    </Center>
                )}
            </SimpleGrid>
        </Stack>
    );
};

export default Root;
