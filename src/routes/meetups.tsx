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
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import HelperText from "../components/Display/HelperText";
import { useTelegram } from "../context/TelegramProvider";
import { useWebUser } from "../context/WebAuthProvider";
import { getUserMeetups, Meetup } from "../firebase/db/repositories/meetups";
import { Link, useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns/esm";
import { signOutAll } from "../firebase/auth";
import { deleteData } from "../firebase/db/repositories/users";
import {
    ERROR_TOAST_OPTIONS,
    SUCCESS_TOAST_OPTIONS,
} from "../utils/toasts.utils";
const MeetupsPage = () => {
    const { user } = useTelegram();
    const { webUser, clearUser } = useWebUser();

    const meetupUser = user ? user : webUser;
    const [meetups, setMeetups] = useState<Meetup[]>([]);

    useEffect(() => {
        document.title = `Look4Times | Your meetups`;
    }, []);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // filter and put all the ended meetups at the end
    const f = meetups
        .filter((m) =>
            m.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        .sort((a, b) => {
            if (a.isEnded && !b.isEnded) return 1;
            if (!a.isEnded && b.isEnded) return -1;
            return 0;
        });

    useEffect(() => {
        if (meetupUser)
            getUserMeetups(meetupUser.id).then(setMeetups).catch(console.error);
    }, [meetupUser]);

    const navigate = useNavigate();

    const { onOpen, isOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const onDeleteClicked = () => onOpen();

    const toast = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const onDelete = () => {
        if (meetupUser) {
            setIsDeleting(true);
            deleteData(meetupUser.id)
                .then(() => signOutAll(clearUser!))
                .then(() => {
                    toast({
                        title: "User data deleted",
                        description: `All user data has been deleted.`,
                        ...SUCCESS_TOAST_OPTIONS,
                    });
                    navigate("/");
                })
                .catch((e: any) => {
                    toast({
                        title: "Error deleting user data",
                        description: `${e.message}\nContact marcussoh38@gmail.com for support.`,
                        ...ERROR_TOAST_OPTIONS,
                    });
                })
                .finally(() => setIsDeleting(false));
        }
    };
    if (!meetupUser) {
        return <> Loading... </>;
    }

    const handleSignOut = () => {
        navigate("/");
        signOutAll(clearUser!);
    };

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
        <>
            <Grid templateColumns={{ base: "1fr", md: "256px 1fr" }} p={0}>
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
                                colorScheme="purple"
                            >
                                {" "}
                                Sign out{" "}
                            </Button>
                            <Button
                                size="sm"
                                onClick={onDeleteClicked}
                                colorScheme="red"
                            >
                                Delete all user data
                            </Button>
                        </Stack>
                    </Center>
                </GridItem>
                <GridItem>
                    <Flex>
                        <Input
                            placeholder="Search for a meetup..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <NavLink as={Link} to="/create">
                            <Button colorScheme="purple" ml={2}>
                                {" "}
                                New event{" "}
                            </Button>
                        </NavLink>
                    </Flex>
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
                                            "EEEE, d MMMM yyyy h:mm aaa"
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
                                            <Text
                                                fontSize="sm"
                                                fontWeight="light"
                                            >
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
                                            <Text
                                                fontSize="sm"
                                                fontWeight="light"
                                            >
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
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete all data
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                            All your user data will be deleted, including from
                            any meetups that you have created, but NOT any
                            meetups for which you have indicated.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={onDelete}
                                ml={3}
                                isLoading={isDeleting}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
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
