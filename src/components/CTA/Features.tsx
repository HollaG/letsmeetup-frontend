import { ReactElement } from "react";
import { Box, SimpleGrid, Icon, Text, Stack, Flex } from "@chakra-ui/react";
import { FcAssistant, FcDonate, FcInTransit } from "react-icons/fc";

interface FeatureProps {
    title: string;
    text: string;
    icon: ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
    return (
        <Stack>
            <Flex
                w={16}
                h={16}
                align={"center"}
                justify={"center"}
                color={"white"}
                rounded={"full"}
                bg={"gray.100"}
                mb={1}
            >
                {icon}
            </Flex>
            <Text fontWeight={600}>{title}</Text>
            <Text color={"gray.600"}>{text}</Text>
        </Stack>
    );
};

export default function SimpleThreeColumns() {
    return (
        <Box p={4}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                <Feature
                    icon={<Icon as={FcAssistant} w={10} h={10} />}
                    title={"Coordination made easy"}
                    text={
                        "No more having to ask individual people for their availability. Simply send them a link, and they indicate. Simple as that!"
                    }
                />
                <Feature
                    icon={<Icon as={FcDonate} w={10} h={10} />}
                    title={"Customisable to your needs"}
                    text={
                        "Need to limit the number of people who can reply? Or perhaps your ...TBC? No problem!"
                    }
                />
                <Feature
                    icon={<Icon as={FcInTransit} w={10} h={10} />}
                    title={"Full integration with Telegram"}
                    text={
                        "MeetUp is fully integrated with Telegram. Simply interact with the bot @letsmeetupbot to get started!"
                    }
                />
            </SimpleGrid>
        </Box>
    );
}
