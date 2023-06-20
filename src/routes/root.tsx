import {
    Button,
    Center,
    Heading,
    Stack,
    SimpleGrid,
    Image,
    Box,
    useMediaQuery,
    Flex,
    AspectRatio,
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
            <Stack spacing={8}>
                <Heading
                    textAlign="center"
                    fontSize={{ base: "4xl", md: "6xl" }}
                >
                    Demo video 📹
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }}>
                    {showSecondIllustration && (
                        <Flex justifyContent="center" alignItems="center">
                            <Image
                                src={"/images/homepage4.svg"}
                                maxW="350px"
                                alt="Illustration of tutorial video"
                            />
                        </Flex>
                    )}
                    <AspectRatio ratio={16 / 9}>
                        <iframe
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/7cBGRAFYNYo"
                            title="YouTube video player"
                            allowFullScreen
                        ></iframe>
                    </AspectRatio>
                </SimpleGrid>
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
                        <Image
                            src="/images/homepage3.svg"
                            maxW="350px"
                            alt="Illustration of people having questions"
                        />
                    </Center>
                )}
            </SimpleGrid>
        </Stack>
    );
};

export default Root;
