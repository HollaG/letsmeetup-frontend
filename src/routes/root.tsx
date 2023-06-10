import { Heading, Stack, Text } from "@chakra-ui/react";
import { useRef } from "react";
import CallToActionWithIllustration from "../components/CTA/CTA";
import SimpleThreeColumns from "../components/CTA/Features";

const Root = () => {
    const featuresRef = useRef<HTMLDivElement>(null);
    return (
        <Stack>
            <CallToActionWithIllustration featuresRef={featuresRef} />
            <Heading textAlign="center" fontSize={"4xl"}>
                Features 🙌
            </Heading>
            <SimpleThreeColumns featuresRef={featuresRef} />
        </Stack>
    );
};

export default Root;
