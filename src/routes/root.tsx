import {
    Button,
    Center,
    Heading,
    Stack,
    Text,
    Link as NavLink,
} from "@chakra-ui/react";
import { useRef } from "react";
import CallToActionWithIllustration from "../components/CTA/CTA";
import SimpleThreeColumns from "../components/CTA/Features";
import { Link } from "react-router-dom";
const Root = () => {
    const featuresRef = useRef<HTMLDivElement>(null);
    return (
        <Stack>
            <CallToActionWithIllustration featuresRef={featuresRef} />
            <Heading textAlign="center" fontSize={"4xl"}>
                Features 🙌
            </Heading>
            <SimpleThreeColumns featuresRef={featuresRef} />
            <Center>
                <Stack>
                    <Heading fontSize={"3xl"}> Have more questions? 🤔</Heading>
                    <Center>
                        <Button
                            as={Link}
                            to="/about"
                            variant="ghost"
                            fontFamily="Zilla Slab"
                        >
                            {" "}
                            Check out the About page ⟶{" "}
                        </Button>
                    </Center>
                </Stack>
            </Center>
        </Stack>
    );
};

export default Root;
