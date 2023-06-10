import { CheckIcon, MinusIcon } from "@chakra-ui/icons";
import {
    Alert,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Center,
    Collapse,
    Container,
    Divider,
    Flex,
    FormControl,
    FormHelperText,
    Heading,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    InputRightElement,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    Textarea,
    useColorMode,
    useColorModeValue,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { redirect, useNavigate, useSearchParams } from "react-router-dom";
import useStateRef from "react-usestateref";
import { URLSearchParams } from "url";
import CalendarContainer from "../components/Calendar/CalendarContainer";
import HelperText from "../components/Display/HelperText";
import TimeContainer, {
    create30MinuteIncrements,
} from "../components/Time/TimeContainer";
import TimeRangeSelector from "../components/Time/TimeRangeSelector";
import { useTelegram } from "../context/TelegramProvider";
import { useWebUser } from "../context/WebAuthProvider";
import { auth } from "../firebase";
import { signInWithoutUsername } from "../firebase/auth/anonymous";
import { create, Meetup } from "../firebase/db/repositories/meetups";
import {
    createIfNotExists,
    IMeetupUser,
} from "../firebase/db/repositories/users";
import { ITelegramUser } from "../types/telegram";
import { TimeSelection } from "../types/types";
import {
    ERROR_TOAST_OPTIONS,
    SUCCESS_TOAST_OPTIONS,
} from "../utils/toasts.utils";
import { LoginCard, LoginInfo } from "./auth";

const Create = () => {
    const [title, setTitle, titleRef] = useStateRef<string>("");
    const [description, setDescription, descriptionRef] =
        useStateRef<string>("");

    const [datesSelected, setDatesSelected, datesRef] = useStateRef<string[]>(
        []
    );

    const [timesSelected, setTimesSelected, timesRef] =
        useStateRef<TimeSelection>([]);

    const [isFullDay, setIsFullDay, isFullDayRef] = useStateRef<boolean>(false);

    const { user, webApp, style } = useTelegram();
    const webUser = useWebUser();

    const [userCanSubmit, setUserCanSubmit, userCanSubmitRef] =
        useStateRef<boolean>(false);

    const [[startMin, endMin], setTime, timeRef] = useStateRef([
        9 * 60,
        17 * 60,
    ]); // in minutes

    const [
        notificationThreshold,
        setNotificationThreshold,
        notificationThresholdRef,
    ] = useStateRef<number>();
    const [limitPerSlot, setLimitPerSlot, limitPerSlotRef] =
        useStateRef<number>();
    const [
        limitNumberRespondents,
        setLimitNumberRespondents,
        limitNumberRespondentsRef,
    ] = useStateRef<number>();
    const [
        limitSlotsPerRespondent,
        setLimitSlotsPerRespondent,
        limitSlotsPerRespondentRef,
    ] = useStateRef<number>();

    // handle the form state TODO: replace with useStateRef
    useEffect(() => {
        if (datesSelected.length !== 0 && title !== "") {
            // at least one date must be selected
            if (isFullDay) {
                // if it's full day, no times need to be selected
                setUserCanSubmit(true);
            } else {
                // if it's not full day, at least one time must be selected
                if (timesSelected.length !== 0) {
                    setUserCanSubmit(true);
                } else {
                    setUserCanSubmit(false);
                }
            }
        } else {
            setUserCanSubmit(false);
        }
        // console.log(userCanSubmit);
    }, [
        datesSelected.length,
        timesSelected.length,
        title,
        description,
        isFullDay,
    ]);

    const [_, setHasUserSubmitted, hasUserSubmittedRef] = useStateRef(false);

    /**
     *
     * The submit handler when a user clicks Telegram's MainButton.
     *
     * Note: Runs twice for some reason.
     *
     *
     */
    const onSubmit = useCallback(() => {
        // setIsSubmitting(true);
        // console.log("submitting data or smt");
        // webApp?.MainButton.showProgress(false);

        // Validate data
        if (!userCanSubmitRef.current || hasUserSubmittedRef.current) {
            return console.log("can't submit!");
        }

        setHasUserSubmitted(true);

        const telegramUser = {
            id: user!.id.toString(),
            first_name: user!.first_name,
            username: (user! as ITelegramUser).username,
            photo_url: user!.photo_url || "",
            type: "telegram",
        };
        const MeetupData: Meetup = {
            title: titleRef.current,
            description: descriptionRef.current,
            date_created: new Date(),
            creator: telegramUser,
            isFullDay: isFullDayRef.current,
            timeslots: isFullDayRef.current ? [] : timesRef.current,
            dates: datesRef.current,
            users: [],
            notified: false,
            selectionMap: {},
            messages: [],
            isEnded: false,
            last_updated: new Date(),
            options: {
                notificationThreshold:
                    notificationThresholdRef.current || Number.MAX_VALUE,

                limitNumberRespondents:
                    limitNumberRespondentsRef.current || Number.MAX_VALUE,
                limitPerSlot: limitPerSlotRef.current || Number.MAX_VALUE,
                limitSlotsPerRespondent:
                    limitSlotsPerRespondentRef.current || Number.MAX_VALUE,
            },
            creatorInfoMessageId: 0,
        };

        console.log({ MeetupData });

        // for users through telegram
        if (user) {
            createIfNotExists(telegramUser)
                .then(() => create(MeetupData))
                .then((res) => {
                    // send the ID back to Telegram
                    // webApp?.sendData(res.id)
                    // webApp?.close()
                    const newDocId = res.id;
                    webApp?.switchInlineQuery(titleRef.current, [
                        "users",
                        "groups",
                        "channels",
                        "bots",
                    ]);
                    webApp?.close();
                })
                .catch((e) => {
                    alert("somme error!!" + e.toString());
                });
        } else {
        }
    }, [webApp]);

    /**
     * Initialize button at bottom of screen
     */
    useEffect(() => {
        if (webApp?.initData) {
            webApp.MainButton.isVisible = true;
            webApp.MainButton.text = "Create";
            webApp.MainButton.color = btnColor;

            webApp.MainButton.disable();
        }
    }, [webApp, webApp?.MainButton]);

    /**
     * Handle the title change
     * Limit to 256 characters
     */
    const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.trim().length > 256) {
            return;
        }
        setTitle(value);
    };

    /**
     * Handle the description change
     * Limit to 1024 characters
     *
     */
    const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.trim().length > 1024) {
            return;
        }
        setDescription(value);
    };

    useEffect(() => {
        if (webApp?.initData) {
            if (userCanSubmit) {
                enableButton();
            } else {
                disableButton();
            }
            console.log("updating onSubmit");
        }
    }, [webApp, userCanSubmit, style]);

    useEffect(() => {
        if (webApp?.initData) {
            console.log("Bound the submit!");
            webApp.MainButton.onClick(onSubmit);
        }
    }, [webApp?.initData]);

    // useEffect(() => {
    //     if (webApp?.initData) {
    //         if (userCanSubmit) {
    //             enableButton();
    //         } else {
    //             disableButton();
    //         }
    //         // console.log("updating onSubmit");
    //         // webApp.MainButton.onClick(onSubmit);
    //     }
    // }, [webApp?.initData, style, userCanSubmit]);

    /**
     * Automatically add the times from 9 - 5 based on the dates if the user has not selected a day
     *
     * Pristine refers to whether the 'set individual date times' switch has been touched.
     */
    const [pristine, setPristine, pristineRef] = useStateRef<boolean>(true);
    const onStop = () => {
        if (pristineRef.current) {
            const flat = create30MinuteIncrements(
                timeRef.current[0],
                timeRef.current[1]
            );
            setTimesSelected(
                flat.flatMap((time) =>
                    datesRef.current.map((date) => `${time}::${date}`)
                )
            );
        }
    };

    // Handle the colors changing
    const _btnColor = useColorModeValue("purple.200", "purple.700");
    const _disabledBtnColor = useColorModeValue("#EDF2F7", "#1A202C");
    const _enabledTextColor = useColorModeValue("#ffffff", "#000000");
    const _disabledTextColor = useColorModeValue("#000000", "#ffffff");

    const btnColor = style?.button_color || _btnColor;
    const disabledBtnColor = style?.secondary_bg_color || _disabledBtnColor;
    const enabledTextColor = style?.button_text_color || _enabledTextColor;
    const disabledTextColor = style?.text_color || _disabledTextColor;

    /**
     * Disables the button, along with setting the color
     */
    const disableButton = () => {
        // console.log("disabling button");
        if (webApp?.initData) {
            // webApp.MainButton.isVisible = false;
            webApp.MainButton.color = disabledBtnColor;
            webApp.MainButton.disable();
            webApp.MainButton.setText("Please fill in all required fields");
            webApp.isClosingConfirmationEnabled = false;
            webApp.MainButton.textColor = disabledTextColor;
        }
    };

    /**
     * Enables the button, along with setting the color
     */
    const enableButton = () => {
        // console.log("enabling button");

        if (webApp?.initData) {
            // webApp.MainButton.isVisible = true;
            webApp.MainButton.color = btnColor;
            webApp.MainButton.enable();
            webApp.MainButton.setText("Create and share meetup");
            webApp.isClosingConfirmationEnabled = true;
            webApp.MainButton.textColor = enabledTextColor;
        }
    };

    const navigate = useNavigate();

    const [newUserName, setNewUserName] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const toast = useToast();
    const webUserSubmit = async () => {
        try {
            let tWebUser: IMeetupUser;

            setIsSubmitting(true);
            if (!webUser) {
                let user = await signInWithoutUsername(newUserName);
                tWebUser = {
                    id: user.user.uid,
                    type: "Guest",
                    first_name: newUserName,
                    last_name: "",
                } as IMeetupUser;
            } else {
                tWebUser = {
                    id: webUser.id,
                    type: webUser.type || "Guest",
                    first_name: webUser.first_name,
                    last_name: webUser.last_name || "",
                } as IMeetupUser;
            }

            const MeetupData: Meetup = {
                title: titleRef.current,
                description: descriptionRef.current,
                date_created: new Date(),
                creator: tWebUser,
                isFullDay: isFullDayRef.current,
                timeslots: isFullDayRef.current ? [] : timesRef.current,
                dates: datesRef.current,
                users: [],
                notified: false,
                selectionMap: {},
                messages: [],
                isEnded: false,
                last_updated: new Date(),
                options: {
                    notificationThreshold:
                        notificationThresholdRef.current || Number.MAX_VALUE,

                    limitNumberRespondents:
                        limitNumberRespondentsRef.current || Number.MAX_VALUE,
                    limitPerSlot: limitPerSlotRef.current || Number.MAX_VALUE,
                    limitSlotsPerRespondent:
                        limitSlotsPerRespondentRef.current || Number.MAX_VALUE,
                },
                creatorInfoMessageId: 0,
            };

            console.log(MeetupData);

            const meetup = await create(MeetupData);
            toast({
                title: "Meetup created",
                description: "Your meetup has been created",
                ...SUCCESS_TOAST_OPTIONS,
            });
            navigate(`/meetup/${meetup.id}`);
        } catch (e: any) {
            toast({
                title: "Error creating meetup",
                description: e.toString(),
                ...ERROR_TOAST_OPTIONS,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancelRef = useRef<HTMLButtonElement>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // on sign in, close the popup, if any
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("LOGGED IN", user);
            if (user) onClose();
        });
        return () => unsubscribe();
    }, []);

    return (
        <Stack
            spacing={16}
            justifyContent="center"
            alignItems={"center"}
            // divider={<Divider />}
        >
            <Container id="container-dates" p={0} maxW="1000px">
                <Stack>
                    <Box>
                        <Heading fontSize={"2xl"}>
                            {" "}
                            📅 When do you want your meetup?
                        </Heading>

                        <HelperText>
                            {" "}
                            {isMobile ? "Touch / Touch" : "Click / click"} and
                            drag to select.
                        </HelperText>
                    </Box>
                    {/* <Center>
                        <Container justifyContent="center"> */}
                    {/* <Box>
                        <Box maxWidth={"500px"} mx={"auto"}> */}
                    <CalendarContainer
                        datesSelected={datesRef.current}
                        setDatesSelected={setDatesSelected}
                        onStop={onStop}
                    />
                    {/* </Box>
                    </Box> */}

                    {/* </Container>
                    </Center> */}
                </Stack>
            </Container>

            <Container id="container-timings" p={0} maxW="1000px">
                <Stack>
                    <Heading fontSize={"2xl"}>
                        {" "}
                        🕔 What times do you want to have it on?
                    </Heading>
                    <Flex direction={"row"} justifyContent="space-between">
                        <Text> Set as full day </Text>
                        <Switch
                            isChecked={isFullDay}
                            onChange={(e) => {
                                setIsFullDay(e.target.checked);
                            }}
                            // colorScheme={"#ffffff"}
                            sx={{
                                "span.chakra-switch__track[data-checked]": {
                                    backgroundColor: btnColor,
                                },
                                // "span.chakra-switch__track:not([data-checked])": {
                                //     backgroundColor:
                                //         style?.secondary_bg_color,
                                // },
                            }}
                        />
                    </Flex>
                    <Collapse in={!isFullDay}>
                        <TimeContainer
                            datesSelected={datesRef.current}
                            setTimesSelected={setTimesSelected}
                            timesSelected={timesRef.current}
                            setPristine={setPristine}
                            pristine={pristine}
                            endMin={endMin}
                            setTime={setTime}
                            timeRef={timeRef}
                            startMin={startMin}
                        />
                    </Collapse>
                </Stack>{" "}
            </Container>

            <Container id="container-settings" p={0} maxW="1000px">
                {" "}
                <Stack>
                    <Box>
                        <Heading fontSize={"2xl"}>
                            ⚙️ Customize your meetup
                        </Heading>
                        <HelperText>
                            Unmodified settings will be set to their default.
                        </HelperText>
                    </Box>
                    {user && (
                        <Flex
                            justifyContent={"space-between"}
                            alignItems="center"
                        >
                            <Box>
                                <Text>
                                    {" "}
                                    Send a notification when number of users
                                    hits:{" "}
                                </Text>
                                <HelperText>
                                    {" "}
                                    Default: No notification{" "}
                                </HelperText>
                            </Box>
                            <Box>
                                <InputGroup size="sm">
                                    <NumberInput
                                        width="72px"
                                        value={notificationThreshold}
                                        onChange={(e) => {
                                            setNotificationThreshold(
                                                parseInt(e)
                                            );
                                        }}
                                        min={1}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </InputGroup>
                            </Box>
                        </Flex>
                    )}

                    <Flex justifyContent={"space-between"} alignItems="center">
                        <Box>
                            <Text> Limit the number of users to: </Text>
                            <HelperText> Default: No limit</HelperText>
                        </Box>
                        <Box>
                            <InputGroup size="sm">
                                <NumberInput
                                    width="72px"
                                    value={limitNumberRespondents}
                                    onChange={(e) => {
                                        setLimitNumberRespondents(parseInt(e));
                                    }}
                                    min={1}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </InputGroup>
                        </Box>
                    </Flex>

                    {/* <Flex justifyContent={"space-between"} alignItems="center">
                    <Box>
                        <Text>
                            {" "}
                            Limit the number of slots a user can select to:{" "}
                        </Text>
                        <HelperText> Default: No limit </HelperText>
                    </Box>
                    <Box>
                        <InputGroup size="sm">
                            <Input
                                type="number"
                                placeholder="0"
                                width="72px"
                                value={limitSlotsPerRespondent}
                                onChange={(e) =>
                                    setLimitSlotsPerRespondent(
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                            <InputRightElement>
                                {limitSlotsPerRespondent ? (
                                    <CheckIcon color="green.500" />
                                ) : (
                                    <MinusIcon color="gray.500" />
                                )}
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                </Flex> */}

                    <Flex justifyContent={"space-between"} alignItems="center">
                        <Box>
                            <Text>
                                {" "}
                                Limit the number of users per slot to:{" "}
                            </Text>
                            <HelperText> Default: No limit </HelperText>
                        </Box>
                        <Box>
                            <InputGroup size="sm">
                                <NumberInput
                                    width="72px"
                                    value={limitPerSlot}
                                    onChange={(e) => {
                                        setLimitPerSlot(parseInt(e));
                                    }}
                                    min={1}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </InputGroup>
                        </Box>
                    </Flex>
                </Stack>{" "}
            </Container>

            <Container id="container-details" p={0} maxW="1000px">
                <Stack>
                    <Heading fontSize={"2xl"}>
                        🎉 Give your meetup a name so people know!{" "}
                    </Heading>
                    <Input
                        id="title"
                        placeholder="Event title (required)"
                        required
                        value={title}
                        onChange={onTitleChange}
                        maxLength={256}
                    />
                    <Textarea
                        id="description"
                        placeholder="Event description (optional)"
                        value={description}
                        onChange={onDescriptionChange}
                        maxLength={4096}
                    />
                </Stack>
            </Container>
            {!user && !webUser && (
                <Container id="container-user" p={0} maxW="1000px">
                    <Stack>
                        <Heading fontSize={"2xl"}>
                            👤 Just one last thing...
                        </Heading>
                        <Alert
                            status="info"
                            display="flex"
                            justifyContent="space-between"
                        >
                            <Flex alignItems="center">
                                <AlertIcon />
                                <Flex flexDir="column">
                                    <AlertTitle>
                                        We notice you're not signed in!
                                    </AlertTitle>
                                    Create an account now to have access to
                                    features such as meetup editing.
                                </Flex>
                            </Flex>
                            <Button
                                colorScheme="purple"
                                size="sm"
                                onClick={onOpen}
                            >
                                {" "}
                                Sign in{" "}
                            </Button>
                        </Alert>

                        <Text>
                            Alternatively, just enter your name below to
                            continue as a guest:{" "}
                        </Text>
                        <Input
                            placeholder="Your name (required)"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            maxLength={128}
                        />
                        {/* <Divider />
                        <Text> Or, create an account </Text> */}
                    </Stack>
                </Container>
            )}
            <Container id="container-submit" p={0} maxW="1000px">
                {!user && (
                    <Center>
                        <Button
                            colorScheme="purple"
                            isDisabled={!userCanSubmit}
                            onClick={webUserSubmit}
                            isLoading={isSubmitting}
                        >
                            {userCanSubmit
                                ? "Create meetup"
                                : "Please fill in all required fields"}
                        </Button>
                    </Center>
                )}
            </Container>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                size="xl"
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Create or sign in to your account
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <LoginInfo />
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRef}
                                onClick={onClose}
                                variant="outline"
                            >
                                Never mind, I'll continue as a guest
                            </Button>
                            {/* <Button colorScheme="red" onClick={() => {}} ml={3}>
                                Delete
                            </Button> */}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Stack>
    );
};

export default Create;
