import { ReactElement, ReactNode } from "react";
import {
    Box,
    SimpleGrid,
    Icon,
    Text,
    Stack,
    Flex,
    Link as NavLink,
    Button,
} from "@chakra-ui/react";
import { FcAssistant, FcEngineering } from "react-icons/fc";
import { FaTelegram } from "react-icons/fa";
import { Link } from "react-router-dom";

interface FeatureProps {
    title: string;

    icon: ReactElement;
    children?: ReactNode | ReactNode[];
}

const Feature = ({ title, children, icon }: FeatureProps) => {
    return (
        <Stack>
            <Flex
                w={16}
                h={16}
                align={"center"}
                justify={"center"}
                color={"white"}
                rounded={"full"}
                bg={"purple.100"}
                mb={1}
            >
                {icon}
            </Flex>
            <Text fontWeight={600}>{title}</Text>
            {children}
        </Stack>
    );
};

export default function SimpleThreeColumns({
    featuresRef,
}: {
    featuresRef: React.RefObject<HTMLDivElement>;
}) {
    return (
        <Box p={4} ref={featuresRef}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                <Feature
                    icon={<Icon as={FcAssistant} w={10} h={10} />}
                    title={"Coordination made easy"}
                >
                    <Text>
                        {" "}
                        Simplify the process of gathering availability. <br />
                        <br /> Share a link and let them indicate. It's as easy
                        as that!
                    </Text>
                    <NavLink
                        as={Link}
                        to="/meetup/MPwSU7Z4ebZOuzVcwLOR"
                        fontFamily="Zilla Slab"
                        fontSize={"lg"}
                    >
                        <Button fontWeight="600" size="lg" variant="ghost">
                            Try it out ⟶
                        </Button>
                    </NavLink>
                </Feature>
                <Feature
                    icon={<Icon as={FcEngineering} w={10} h={10} />}
                    title={"Customisable to your needs"}
                >
                    <Text>
                        Want to limit to the number of people who can come? No
                        problem! <br /> <br />
                        You can customise your meetup to your needs and more.
                    </Text>{" "}
                    <NavLink
                        as={Link}
                        to="/meetup/OZDYuUHbAOtFNkfRlYJl"
                        fontFamily="Zilla Slab"
                        fontSize={"lg"}
                    >
                        <Button fontWeight="600" size="lg" variant="ghost">
                            See an example ⟶
                        </Button>
                    </NavLink>
                </Feature>
                <Feature
                    icon={
                        <Icon
                            as={FaTelegram}
                            w={10}
                            h={10}
                            color="telegram.900"
                        />
                    }
                    title={"Full integration with Telegram"}
                >
                    <Text>
                        Look4Times is fully integrated with Telegram. You can
                        create and manage your meetups without leaving Telegram!{" "}
                        <br /> <br />
                        Simply interact with the bot{" "}
                        <NavLink isExternal href="https://t.me/look4timesbot">
                            {" "}
                            @look4timesbot{" "}
                        </NavLink>{" "}
                        to get started!
                    </Text>
                    <NavLink
                        fontFamily="Zilla Slab"
                        fontSize={"lg"}
                        isExternal
                        href="https://t.me/look4timesbot"
                    >
                        <Button fontWeight="600" size="lg" variant="ghost">
                            Get started ⟶
                        </Button>
                    </NavLink>
                </Feature>
            </SimpleGrid>
        </Box>
    );
}
