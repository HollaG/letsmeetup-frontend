import {
    useColorModeValue,
    FormControl,
    Stack,
    Heading,
    Input,
    Textarea,
    Flex,
    Switch,
    Collapse,
    InputGroup,
    Box,
    Alert,
    AlertIcon,
    NumberInput,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInputField,
    NumberInputStepper,
    Button,
    Center,
    useToast,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Link as NavLink,
    FormLabel,
    Checkbox,
} from "@chakra-ui/react";
import { format, parse } from "date-fns";
import { addYears } from "date-fns/esm";
import { Timestamp } from "firebase/firestore";
import { useEffect, useCallback, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { Link, useLoaderData, useParams } from "react-router-dom";
import useStateRef from "react-usestateref";
import { removeDate } from ".";
import FancyButton from "../../components/Buttons/FancyButton";
import CalendarContainer from "../../components/Calendar/CalendarContainer";
import HelperText from "../../components/Display/HelperText";
import TimeContainer from "../../components/Time/TimeContainer";
import { useTelegram } from "../../context/TelegramProvider";
import { useWebUser } from "../../context/WebAuthProvider";
import {
    Meetup,
    update,
    UserAvailabilityData,
} from "../../firebase/db/repositories/meetups";
import { TimeSelection } from "../../types/types";
import {
    ERROR_TOAST_OPTIONS,
    SUCCESS_TOAST_OPTIONS,
} from "../../utils/toasts.utils";

const MeetupEditPage = () => {
    const { meetupId } = useParams<{
        meetupId: string;
    }>() as { meetupId: string };
    let { meetup: loadedMeetup } = useLoaderData() as { meetup: Meetup };

    // don't allow edit access if meetup's creator is not same as telegram

    const [title, setTitle, titleRef] = useStateRef<string>(loadedMeetup.title);
    const [description, setDescription, descriptionRef] = useStateRef<string>(
        loadedMeetup.description || ""
    );

    const [datesSelected, setDatesSelected, datesRef] = useStateRef<string[]>(
        loadedMeetup.dates
    );

    const [timesSelected, setTimesSelected, timesRef] =
        useStateRef<TimeSelection>(loadedMeetup.timeslots);

    const [isFullDay, setIsFullDay, isFullDayRef] = useStateRef<boolean>(
        loadedMeetup.isFullDay
    );

    const { user, webApp, style } = useTelegram();
    const webUser = useWebUser();

    const userId = user?.id || (webUser && webUser?.id) || "";
    const [userCanSubmit, setUserCanSubmit, userCanSubmitRef] =
        useStateRef<boolean>(false);

    useEffect(() => {
        document.title = `${loadedMeetup.creator.first_name}'s meetup` || "";
    }, [loadedMeetup]);
    const times = [...new Set(loadedMeetup.timeslots.map(removeDate))].sort(
        (a, b) => a - b
    );

    const initStartMin = loadedMeetup.timeslots.length ? times[0] : 0;
    const initEndMin = loadedMeetup.timeslots.length
        ? times[times.length - 1] + 30 // add 30 because the value gotten is the START of the 30-min slot
        : 24 * 60;
    const [[startMin, endMin], setTime, timeRef] = useStateRef([
        initStartMin,
        initEndMin,
    ]); // in minutes

    /**
     * Advanced settings
     */
    const [
        notificationThreshold,
        setNotificationThreshold,
        notificationThresholdRef,
    ] = useStateRef<number | undefined>(
        loadedMeetup.options.notificationThreshold === Number.MAX_VALUE
            ? undefined
            : loadedMeetup.options.notificationThreshold
    );
    const [limitPerSlot, setLimitPerSlot, limitPerSlotRef] = useStateRef<
        number | undefined
    >(
        loadedMeetup.options.limitPerSlot === Number.MAX_VALUE
            ? undefined
            : loadedMeetup.options.limitPerSlot
    );
    const [
        limitNumberRespondents,
        setLimitNumberRespondents,
        limitNumberRespondentsRef,
    ] = useStateRef<number | undefined>(
        loadedMeetup.options.limitNumberRespondents === Number.MAX_VALUE
            ? undefined
            : loadedMeetup.options.limitNumberRespondents
    );
    const [
        limitSlotsPerRespondent,
        setLimitSlotsPerRespondent,
        limitSlotsPerRespondentRef,
    ] = useStateRef<number | undefined>(
        loadedMeetup.options.limitSlotsPerRespondent === Number.MAX_VALUE
            ? undefined
            : loadedMeetup.options.limitSlotsPerRespondent
    );

    const [endAt, setEndAt, endAtRef] = useStateRef<string>(
        format(
            loadedMeetup.options.endAt
                ? (loadedMeetup.options.endAt as any as Timestamp).toDate()
                : addYears(new Date(), 1),
            "yyyy-MM-dd"
        )
    );

    const [
        notifyOnEveryResponse,
        setNotifyOnEveryResponse,
        notifyOnEveryResponseRef,
    ] = useStateRef<0 | 1 | 2>(loadedMeetup.options.notifyOnEveryResponse);

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
    }, [
        datesSelected.length,
        timesSelected.length,
        title,
        description,
        isFullDay,
    ]);

    const [_, setHasUserSubmitted, hasUserSubmittedRef] = useStateRef(false);
    const toast = useToast();

    /**
     * Submits the updated data to the server.
     *
     * @returns Promise
     */
    const submitUpdate = () => {
        let newSelectionMap = structuredClone(loadedMeetup.selectionMap);
        // if the creator changed from a full day to a non-full day or vice versa,
        let newUsers: UserAvailabilityData[] = structuredClone(
            loadedMeetup.users
        );
        if (isFullDayRef.current !== loadedMeetup.isFullDay) {
            // remove all the timeslots
            // remove all the selectionMap
            newSelectionMap = {};
            newUsers = [];
        } else {
            // if there are any times set in the old selectionMap as keys that are NOT in the new timeslots / new dates, remove them
            if (isFullDayRef.current) {
                // the meetup was a full day.
                for (const dateStr in loadedMeetup.selectionMap) {
                    if (!datesRef.current.includes(dateStr)) {
                        delete newSelectionMap[dateStr];
                    }
                }

                for (const userData of newUsers) {
                    userData.selected = userData.selected.filter((s) =>
                        datesRef.current.includes(s)
                    );
                }
            } else {
                // the meetup was a time one
                for (const dateTimeStr in loadedMeetup.selectionMap) {
                    if (!timesRef.current.includes(dateTimeStr)) {
                        delete newSelectionMap[dateTimeStr];
                    }
                }
                for (const userData of newUsers) {
                    userData.selected = userData.selected.filter((s) =>
                        timesRef.current.includes(s)
                    );
                }
            }
        }

        // filter the users to remove those who have no more items selected
        newUsers = newUsers.filter((u) => u.selected.length !== 0);

        // special: if the number of new users drops below the notification limit, set notified to false
        if (newUsers.length < loadedMeetup.options.notificationThreshold) {
            loadedMeetup.notified = false;
        }

        const MeetupData: Meetup = {
            ...loadedMeetup,
            title: titleRef.current,
            description: descriptionRef.current,
            // date_created: new Date(),
            // creator: {
            //     id: user!.id,
            //     first_name: user!.first_name,
            //     username: user!.username,
            //     photo_url: user!.photo_url || "",
            // },
            isFullDay: isFullDayRef.current,
            timeslots: isFullDayRef.current ? [] : timesRef.current,
            dates: datesRef.current,
            // users: [],
            // notified: false,
            selectionMap: newSelectionMap,
            // messages: [],
            // isEnded: false,
            options: {
                notificationThreshold:
                    notificationThresholdRef.current ?? Number.MAX_VALUE,

                limitNumberRespondents:
                    limitNumberRespondentsRef.current ?? Number.MAX_VALUE,
                limitPerSlot: limitPerSlotRef.current ?? Number.MAX_VALUE,
                limitSlotsPerRespondent:
                    limitSlotsPerRespondentRef.current ?? Number.MAX_VALUE,
                endAt: endAtRef.current
                    ? parse(endAtRef.current, "yyyy-MM-dd", new Date())
                    : addYears(new Date(), 1),
                notifyOnEveryResponse: notifyOnEveryResponseRef.current ?? 0,
            },
            users: newUsers,
            // creatorInfoMessageId: 0,
        };

        return update(meetupId, MeetupData)
            .then((res) => {
                disableButton();
                // TODO: update the loaded meetup
                setUserCanSubmit(false);
                loadedMeetup = res;
            })
            .catch((e) => {
                alert(e);
            });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
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

        setIsSubmitting(true);

        if (user && webApp) {
            if (loadedMeetup.isFullDay !== isFullDayRef.current) {
                webApp.showPopup(
                    {
                        title: "Warning",
                        message:
                            "Changing the meetup type from a full-day to a part-day meetup will reset everyone's selections!",
                        buttons: [
                            { id: "proceed", text: "OK", type: "destructive" },
                            { id: "cancel", text: "Cancel", type: "cancel" },
                        ],
                    },
                    (buttonId) => {
                        if (buttonId === "proceed") {
                            // setHasUserSubmitted(true);

                            // update the old selectionMap to remove any timings that are now outside of the selected dates and timeslots
                            submitUpdate()
                                .catch((e) => {
                                    webApp.showPopup({
                                        title: "Error",
                                        message: e.toString(),
                                        buttons: [
                                            {
                                                id: "ok",
                                                text: "OK",
                                                type: "cancel",
                                            },
                                        ],
                                    });
                                })
                                .finally(() => {
                                    setIsSubmitting(false);
                                });
                        } else {
                            return;
                        }
                    }
                );
            } else {
                submitUpdate()
                    .catch((e) =>
                        webApp.showPopup({
                            title: "Error",
                            message: e.toString(),
                            buttons: [
                                {
                                    id: "ok",
                                    text: "OK",
                                    type: "cancel",
                                },
                            ],
                        })
                    )
                    .finally(() => {
                        setIsSubmitting(false);
                    });
            }
        } else {
            if (loadedMeetup.isFullDay !== isFullDayRef.current) {
                // show popup
                onOpen();
            } else {
                submitUpdate()
                    .then(() => {
                        toast({
                            title: "Meetup updated!",
                            description: "Your meetup has been updated.",
                            ...SUCCESS_TOAST_OPTIONS,
                        });
                    })
                    .catch((e) => {
                        toast({
                            title: "Error",
                            description: e.toString(),
                            ...ERROR_TOAST_OPTIONS,
                        });
                    })
                    .finally(() => {
                        setIsSubmitting(false);
                    });
            }
        }

        return;
    }, [webApp]);

    /**
     * For when the user confirms destructive action
     */
    const onConfirm = () => {
        submitUpdate()
            .then(() => {
                toast({
                    title: "Meetup updated!",
                    description: "Your meetup has been updated.",
                    ...SUCCESS_TOAST_OPTIONS,
                });
                onClose();
            })
            .catch((e) => {
                toast({
                    title: "Error",
                    description: e.toString(),
                    ...ERROR_TOAST_OPTIONS,
                });
            });
    };

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
    const [pristine, setPristine] = useState<boolean>(true);
    const onStop = () => {
        // if (pristineRef.current) {
        //     const flat = create30MinuteIncrements(
        //         timeRef.current[0],
        //         timeRef.current[1]
        //     );
        //     setTimesSelected(
        //         flat.flatMap((time) =>
        //             datesRef.current.map((date) => `${time}::${date}`)
        //         )
        //     );
        // }
    };

    // Handle the colors changing
    const _btnColor = useColorModeValue("#90CDF4", "#2C5282");
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
            webApp.MainButton.setText("No changes since last save");
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
            webApp.MainButton.setText("Update meetup");
            webApp.isClosingConfirmationEnabled = true;
            webApp.MainButton.textColor = enabledTextColor;
        }
    };

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const AlertEditType = (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Warning: Irreversible action!
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Changing the meetup type from a full-day to a part-day
                        meetup will reset everyone's selections! <br />
                        <br />
                        This action cannot be undone.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={onConfirm} ml={3}>
                            Change type
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );

    if (!user || !loadedMeetup) {
        if (userId !== loadedMeetup?.creator.id) {
            return <>You do not have access to edit this meetup</>;
        }
    }

    return (
        <FormControl>
            <Stack spacing={16}>
                <Stack>
                    <Stack>
                        {" "}
                        <Flex alignItems={"baseline"}>
                            <Heading fontSize={"3xl"}> 📝 Edit meetup </Heading>
                            <NavLink
                                ml={1}
                                as={Link}
                                to={`/meetup/${meetupId}`}
                                fontSize="sm"
                            >
                                {" "}
                                (back to meetup){" "}
                            </NavLink>
                        </Flex>
                    </Stack>
                    <Box>
                        <Heading fontSize={"2xl"} pt={6}>
                            {" "}
                            📅 When do you want your meetup?
                        </Heading>

                        <HelperText>
                            {" "}
                            {isMobile ? "Touch / Touch" : "Click / click"} and
                            drag to select.
                        </HelperText>
                    </Box>
                    <Alert status="warning">
                        <AlertIcon />
                        Please note that removing a date or time that people
                        have indicated WILL remove their indication as well!
                    </Alert>

                    <CalendarContainer
                        datesSelected={datesRef.current}
                        setDatesSelected={setDatesSelected}
                        onStop={onStop}
                    />
                </Stack>
                <Box>
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
                            timeInitiallyOpen={!isFullDay}
                        />
                    </Collapse>
                </Box>
                <Stack>
                    <Box>
                        <Heading fontSize={"2xl"}>
                            ⚙️ Customize your meetup
                        </Heading>
                        <HelperText>
                            Unmodified settings will be set to their default.
                        </HelperText>
                    </Box>
                    <Alert status="warning">
                        <AlertIcon />
                        Please note that changing any 'limit' setting will NOT
                        remove users who have already indicated!
                    </Alert>
                    {user && (
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
                                        Send a notification when number of users
                                        hits:{" "}
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
                        </FormControl>
                    )}
                    <FormControl>
                        <Flex
                            justifyContent={"space-between"}
                            alignItems="center"
                        >
                            <Box>
                                <FormLabel htmlFor="settings-limit-users" m={0}>
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
                                        min={format(new Date(), "yyyy-MM-dd")}
                                    />
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
                                    Recieve a notification on every update
                                </FormLabel>
                                <HelperText>
                                    {" "}
                                    Default: None. Be aware that this can easily
                                    lead to spam from the bot!
                                </HelperText>
                            </Box>
                            <Box>
                                <InputGroup size="lg">
                                    <Checkbox
                                        id="settings-notify-every-response"
                                        isChecked={notifyOnEveryResponse !== 0}
                                        onChange={(e) =>
                                            setNotifyOnEveryResponse(
                                                e.target.checked ? 1 : 0
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
                </Stack>
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
                    />
                    <Textarea
                        id="description"
                        placeholder="Meetup description (optional)"
                        value={description}
                        onChange={onDescriptionChange}
                    />
                </Stack>
                {!user && (
                    <Center>
                        <FancyButton
                            props={{
                                isDisabled: !userCanSubmit,
                                onClick: onSubmit,
                                isLoading: isSubmitting,
                                w: "300px",
                            }}
                        >
                            {userCanSubmit
                                ? "Save your changes 📝"
                                : "No changes since last save"}
                        </FancyButton>
                    </Center>
                )}
            </Stack>
            {AlertEditType}
        </FormControl>
    );
};
export default MeetupEditPage;
