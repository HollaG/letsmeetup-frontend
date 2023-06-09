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
    Checkbox,
    Collapse,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack,
    Switch,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { addYears, format, parse } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import useStateRef from "react-usestateref";
import FancyButton from "../components/Buttons/FancyButton";
import CalendarContainer from "../components/Calendar/CalendarContainer";
import HelperText from "../components/Display/HelperText";
import TimeContainer, {
    create30MinuteIncrements,
} from "../components/Time/TimeContainer";
import { useTelegram } from "../context/TelegramProvider";
import { useWebUser } from "../context/WebAuthProvider";
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
import { LoginInfo } from "./auth";

const Create = () => {
    useEffect(() => {
        document.title = `Look4Times | Create a new meetup`;
    }, []);
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
    const { webUser } = useWebUser();

    const [userCanSubmit, setUserCanSubmit, userCanSubmitRef] =
        useStateRef<boolean>(false);

    const [[startMin, endMin], setTime, timeRef] = useStateRef([
        9 * 60,
        17 * 60,
    ]); // in minutes

    /**
     * Advanced settings
     */
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

    const [endAt, setEndAt, endAtRef] = useStateRef<string>("");

    const [
        notifyOnEveryResponse,
        setNotifyOnEveryResponse,
        notifyOnEveryResponseRef,
    ] = useStateRef<0 | 1 | 2>(0);

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
                endAt: endAtRef.current
                    ? parse(endAtRef.current, "yyyy-MM-dd", new Date())
                    : addYears(new Date(), 1),
                notifyOnEveryResponse: notifyOnEveryResponseRef.current || 0,
            },
            creatorInfoMessageId: 0,
            cannotMakeIt: [],
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
        }
    }, [webApp, userCanSubmit, style]);

    useEffect(() => {
        if (webApp?.initData) {
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
    const _btnColor = useColorModeValue("#D6BCFA", "#553C9A"); // cannot use chakra styling as webapp button style doesn't accept it // purple.200, purple.700
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
                const user = await signInWithoutUsername(newUserName);
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
                    endAt: endAtRef.current
                        ? parse(endAtRef.current, "yyyy-MM-dd", new Date())
                        : addYears(new Date(), 1),
                    notifyOnEveryResponse:
                        notifyOnEveryResponseRef.current || 0, // actually, web users should never be able to even access this property,
                    // but we can put it in for now
                },
                creatorInfoMessageId: 0,
                cannotMakeIt: [],
            };

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
        if (webUser) {
            onClose();
            if (isOpen)
                toast({
                    title: "Signed in",
                    description:
                        "You have been signed in! You can now proceed to create your meetup.",
                    ...SUCCESS_TOAST_OPTIONS,
                });
        }
    }, [webUser]);

    return (
        <form>
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
                                {isMobile
                                    ? "Touch / Touch"
                                    : "Click / click"}{" "}
                                and drag to select.
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
                    <Stack mb={2}>
                        <Heading fontSize={"2xl"}>
                            {" "}
                            🕔 What times do you want to have it on?
                        </Heading>
                        <FormControl>
                            <Flex
                                direction={"row"}
                                justifyContent="space-between"
                            >
                                <FormLabel
                                    htmlFor="isFullDay"
                                    cursor="pointer"
                                    m={0}
                                >
                                    {" "}
                                    Set as full day{" "}
                                </FormLabel>
                                <Switch
                                    id="isFullDay"
                                    isChecked={isFullDay}
                                    onChange={(e) => {
                                        setIsFullDay(e.target.checked);
                                    }}
                                    // colorScheme={"#ffffff"}
                                    sx={{
                                        "span.chakra-switch__track[data-checked]":
                                            {
                                                backgroundColor: btnColor,
                                            },
                                        // "span.chakra-switch__track:not([data-checked])": {
                                        //     backgroundColor:
                                        //         style?.secondary_bg_color,
                                        // },
                                    }}
                                />
                            </Flex>
                        </FormControl>
                    </Stack>
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
                </Container>

                <Container id="container-settings" p={0} maxW="1000px">
                    {" "}
                    <Stack>
                        <Box>
                            <Heading fontSize={"2xl"}>
                                ⚙️ Customize your meetup
                            </Heading>
                            <HelperText>
                                Unmodified settings will be set to their
                                default.
                            </HelperText>
                        </Box>
                        {(user || (webUser && webUser.type === "telegram")) && (
                            <>
                                <FormControl>
                                    <Flex
                                        justifyContent={"space-between"}
                                        alignItems="center"
                                    >
                                        <Box>
                                            <FormLabel
                                                htmlFor="settings-notification"
                                                m={0}
                                            >
                                                {" "}
                                                Send a notification when number
                                                of users hits:{" "}
                                            </FormLabel>
                                            <HelperText>
                                                {" "}
                                                Default: No notification{" "}
                                            </HelperText>
                                        </Box>
                                        <Box>
                                            <InputGroup size="sm">
                                                <NumberInput
                                                    id="settings-notification"
                                                    width="72px"
                                                    value={
                                                        notificationThreshold
                                                    }
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
                                </FormControl>
                                <FormControl>
                                    <Flex
                                        justifyContent={"space-between"}
                                        alignItems="center"
                                    >
                                        <Box>
                                            <FormLabel
                                                m={0}
                                                htmlFor="settings-notify-every-response"
                                            >
                                                Recieve a notification on every
                                                update
                                            </FormLabel>
                                            <HelperText>
                                                {" "}
                                                Default: None. Be aware that
                                                this can easily lead to spam
                                                from the bot!
                                            </HelperText>
                                        </Box>
                                        <Box>
                                            <InputGroup size="lg">
                                                <Checkbox
                                                    id="settings-notify-every-response"
                                                    isChecked={
                                                        notifyOnEveryResponse !==
                                                        0
                                                    }
                                                    onChange={(e) =>
                                                        setNotifyOnEveryResponse(
                                                            e.target.checked
                                                                ? 1
                                                                : 0
                                                        )
                                                    }
                                                    sx={{
                                                        "span.chakra-checkbox__control[data-checked]":
                                                            {
                                                                backgroundColor:
                                                                    style?.button_color,
                                                            },
                                                        // "span.chakra-switch__track:not([data-checked])": {
                                                        //     backgroundColor:
                                                        //         style?.secondary_bg_color,
                                                        // },
                                                    }}
                                                />
                                            </InputGroup>
                                        </Box>
                                    </Flex>
                                </FormControl>
                            </>
                        )}
                        <FormControl>
                            <Flex
                                justifyContent={"space-between"}
                                alignItems="center"
                            >
                                <Box>
                                    <FormLabel
                                        htmlFor="settings-limit-users"
                                        m={0}
                                    >
                                        Limit the number of users to:
                                    </FormLabel>
                                    <HelperText> Default: No limit</HelperText>
                                </Box>
                                <Box>
                                    <InputGroup size="sm">
                                        <NumberInput
                                            id="settings-limit-users"
                                            width="72px"
                                            value={limitNumberRespondents}
                                            onChange={(e) => {
                                                setLimitNumberRespondents(
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
                        </FormControl>

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
                        <FormControl>
                            <Flex
                                justifyContent={"space-between"}
                                alignItems="center"
                            >
                                <Box>
                                    <FormLabel
                                        m={0}
                                        htmlFor="settings-limit-per-slot"
                                    >
                                        {" "}
                                        Limit the number of users per slot to:{" "}
                                    </FormLabel>
                                    <HelperText> Default: No limit </HelperText>
                                </Box>
                                <Box>
                                    <InputGroup size="sm">
                                        <NumberInput
                                            id="settings-limit-per-slot"
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
                        </FormControl>
                        <FormControl>
                            <Flex
                                justifyContent={"space-between"}
                                alignItems="center"
                            >
                                <Box>
                                    <FormLabel m={0} htmlFor="settings-end-at">
                                        Automatically end meetup on:
                                    </FormLabel>
                                    <HelperText>
                                        {" "}
                                        Default: 1 year from now{" "}
                                    </HelperText>
                                </Box>
                                <Box>
                                    <InputGroup size="sm">
                                        <Input
                                            id="settings-end-at"
                                            type="date"
                                            value={endAt}
                                            onChange={(e) =>
                                                setEndAt(e.target.value)
                                            }
                                            min={format(
                                                new Date(),
                                                "yyyy-MM-dd"
                                            )}
                                        />
                                    </InputGroup>
                                </Box>
                            </Flex>
                        </FormControl>
                    </Stack>{" "}
                </Container>

                <Container id="container-details" p={0} maxW="1000px">
                    <Stack>
                        <Heading fontSize={"2xl"}>
                            🎉 Give your meetup a name!
                        </Heading>
                        <Input
                            id="title"
                            placeholder="Meetup title (required)"
                            required
                            value={title}
                            onChange={onTitleChange}
                            maxLength={256}
                        />
                        <Textarea
                            id="description"
                            placeholder="Meetup description (optional)"
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
                            {/* <Button
                            colorScheme="purple"
                            isDisabled={!userCanSubmit}
                            onClick={webUserSubmit}
                            isLoading={isSubmitting}
                        >
                            
                        </Button> */}
                            <FancyButton
                                props={{
                                    isDisabled:
                                        !userCanSubmit ||
                                        (!newUserName && !webUser),
                                    onClick: webUserSubmit,
                                    isLoading: isSubmitting,
                                    w: "300px",
                                    type: "submit",
                                }}
                            >
                                {userCanSubmit && (webUser || newUserName)
                                    ? "Create meetup  🚀"
                                    : "Please fill in all required fields"}
                            </FancyButton>
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
        </form>
    );
};

export default Create;
