import { CheckIcon } from "@chakra-ui/icons";
import {
    Avatar,
    Box,
    Grid,
    GridItem,
    Heading,
    Text,
    Stack,
    Center,
    Input,
    Badge,
    Divider,
    Flex,
    Link as NavLink,
    Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import HelperText from "../components/Display/HelperText";
import { useTelegram } from "../context/TelegramProvider";
import { useWebUser } from "../context/WebAuthProvider";
import { getUserMeetups, Meetup } from "../firebase/db/repositories/meetups";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns/esm";
import { signOut } from "firebase/auth";
import { signOutAll } from "../firebase/auth";
const MeetupsPage = () => {
    const { user } = useTelegram();
    const webUser = useWebUser();

    const meetupUser = user ? user : webUser;
    const [meetups, setMeetups] = useState<Meetup[]>([]);

    const [searchQuery, setSearchQuery] = useState<string>("");

    const f = meetups.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    useEffect(() => {
        if (meetupUser)
            getUserMeetups(meetupUser.id).then(setMeetups).catch(console.error);
    }, [meetupUser]);

    const navigate = useNavigate();

    if (!meetupUser) {
        console.log("not allowed");
        return <> Loading... </>;
    }

    const handleSignOut = () => {
        navigate("/");
        signOutAll();
    };

    console.log(meetupUser);

    return (
        // <SimpleGrid columns={2}>
        //     {" "}
        //     <Box width="160px" bgColor="red" height="80px">
        //         {" "}
        //     </Box>{" "}
        //     <Box bgColor="blue" height="160px">
        //         {" "}
        //     </Box>{" "}
        // </SimpleGrid>
        <Grid templateColumns={{ base: "1fr", md: "256px 1fr" }}>
            <GridItem justifyContent="center" mb={8}>
                <Center>
                    <Stack justifyContent="center">
                        <Center>
                            <Avatar
                                size={"2xl"}
                                src={meetupUser?.photo_url}
                                name={meetupUser?.first_name}
                                justifyContent="center"
                            />
                        </Center>
                        <Heading fontSize="2xl">
                            {" "}
                            {meetupUser?.first_name}{" "}
                        </Heading>
                        <Box>
                            <Text fontWeight="semibold"> Account type</Text>
                            <Text> {meetupUser?.type}</Text>
                        </Box>

                        <Button
                            size="sm"
                            onClick={handleSignOut}
                            colorScheme="blue"
                        >
                            {" "}
                            Sign out{" "}
                        </Button>
                    </Stack>
                </Center>
            </GridItem>
            <GridItem>
                <Input
                    placeholder="Search for a meetup..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* <Heading mt={5}> Your meetups </Heading> */}
                <Stack mt={10} spacing={10} divider={<Divider />}>
                    {f.map((meetup, i) => (
                        <Flex
                            key={i}
                            direction="row"
                            justifyContent="space-between"
                        >
                            <Stack spacing={5}>
                                <Box>
                                    <NavLink
                                        as={Link}
                                        to={`/meetup/${meetup.id}`}
                                    >
                                        <Heading
                                            fontSize={"xl"}
                                            fontWeight="semibold"
                                        >
                                            {" "}
                                            {meetup.title}{" "}
                                            <Badge
                                                colorScheme={
                                                    meetup.isEnded
                                                        ? "red"
                                                        : "green"
                                                }
                                            >
                                                {" "}
                                                {meetup.isEnded
                                                    ? "Ended"
                                                    : "Active"}{" "}
                                            </Badge>
                                            <Badge
                                                colorScheme={
                                                    meetup.isFullDay
                                                        ? "purple"
                                                        : "blue"
                                                }
                                                ml={1}
                                            >
                                                {" "}
                                                {meetup.isFullDay
                                                    ? "Full Day"
                                                    : "Part Day"}{" "}
                                            </Badge>
                                        </Heading>
                                    </NavLink>
                                    {meetup.description && (
                                        <Text> {meetup.description} </Text>
                                    )}
                                </Box>
                                <Flex alignItems={"center"}>
                                    <CustomBadge
                                        color={
                                            meetup.users.length <
                                            meetup.options
                                                .limitNumberRespondents
                                                ? "green"
                                                : "red"
                                        }
                                    />
                                    <Text ml={2}>
                                        {" "}
                                        {meetup.users.length}
                                        {meetup.options
                                            .limitNumberRespondents ===
                                        Number.MAX_VALUE
                                            ? ""
                                            : ` / ${meetup.options.limitNumberRespondents}`}{" "}
                                        responded{" "}
                                    </Text>
                                </Flex>
                                <HelperText>
                                    Last updated{" "}
                                    {format(
                                        (
                                            meetup.date_created as any as Timestamp
                                        ).toDate(),
                                        "EEEE, d MMMM yyyy hh:mm aaa"
                                    )}
                                </HelperText>
                            </Stack>
                            <Stack
                                textAlign={"right"}
                                justifyContent="right"
                                spacing={0}
                            >
                                {meetup.creator.type === "telegram" &&
                                    meetup.options.notificationThreshold !==
                                        Number.MAX_VALUE && (
                                        <Stack spacing={0}>
                                            {" "}
                                            <Flex
                                                alignItems="center"
                                                justifyContent="right"
                                            >
                                                {" "}
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="light"
                                                >
                                                    Notification sent:{" "}
                                                </Text>
                                                <CheckIcon
                                                    color="green"
                                                    ml={1}
                                                    boxSize="4"
                                                />{" "}
                                            </Flex>{" "}
                                            <Flex alignItems="center">
                                                {" "}
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="light"
                                                >
                                                    # users to be notified:{" "}
                                                </Text>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="bold"
                                                    ml={1}
                                                    minW="16px"
                                                    textAlign="center"
                                                >
                                                    {
                                                        meetup.options
                                                            .notificationThreshold
                                                    }
                                                </Text>
                                            </Flex>{" "}
                                        </Stack>
                                    )}
                                {meetup.options.limitNumberRespondents !==
                                    Number.MAX_VALUE && (
                                    <Flex
                                        alignItems="center"
                                        justifyContent="right"
                                    >
                                        {" "}
                                        <Text fontSize="sm" fontWeight="light">
                                            Max # of responses:
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            ml={1}
                                            minW="16px"
                                            textAlign="center"
                                        >
                                            {
                                                meetup.options
                                                    .limitNumberRespondents
                                            }
                                        </Text>
                                    </Flex>
                                )}
                                {meetup.options.limitPerSlot !==
                                    Number.MAX_VALUE && (
                                    <Flex
                                        alignItems="center"
                                        justifyContent="right"
                                    >
                                        {" "}
                                        <Text fontSize="sm" fontWeight="light">
                                            Max # of responses per slot:
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            fontWeight="bold"
                                            ml={1}
                                            minW="16px"
                                            textAlign="center"
                                        >
                                            {meetup.options.limitPerSlot}
                                        </Text>
                                    </Flex>
                                )}
                            </Stack>
                        </Flex>
                    ))}
                </Stack>
            </GridItem>
        </Grid>
    );
};

const CustomBadge = ({ color }: { color: "green" | "red" }) => {
    return (
        <Badge
            colorScheme={color}
            width="20px"
            height="20px"
            borderRadius="50%"
        >
            ㅤ
        </Badge>
    );
};
export default MeetupsPage;
