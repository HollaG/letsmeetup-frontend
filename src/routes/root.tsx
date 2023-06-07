import { Heading, Stack, Text } from "@chakra-ui/react";
import CallToActionWithIllustration from "../components/CTA/CTA";
import SimpleThreeColumns from "../components/CTA/Features";

const Root = () => {
    return (
        <Stack>
            <CallToActionWithIllustration />
            <Heading textAlign="center">Features</Heading>
            <SimpleThreeColumns />
        </Stack>
    );
};

export default Root;
