import { CheckIcon, MinusIcon } from "@chakra-ui/icons";
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
    InputRightElement,
    Text,
    Box,
    Alert,
    AlertIcon,
    NumberInput,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInputField,
    NumberInputStepper,
} from "@chakra-ui/react";
import { useEffect, useCallback } from "react";
import { isMobile } from "react-device-detect";
import { useLoaderData, useParams } from "react-router-dom";
import useStateRef from "react-usestateref";
import { removeDate } from ".";
import CalendarContainer from "../../components/Calendar/CalendarContainer";
import HelperText from "../../components/Display/HelperText";
import TimeContainer, {
    create30MinuteIncrements,
} from "../../components/Time/TimeContainer";
import { useTelegram } from "../../context/TelegramProvider";
import { useWebUser } from "../../context/WebAuthProvider";
import {
    create,
    Meetup,
    update,
    UserAvailabilityData,
} from "../../firebase/db/repositories/meetups";
import { TimeSelection } from "../../types/types";

const MeetupEditPage = () => {
    let { meetupId } = useParams<{
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
                    for (let dateStr in loadedMeetup.selectionMap) {
                        if (!datesRef.current.includes(dateStr)) {
                            delete newSelectionMap[dateStr];
                        }
                    }

                    for (let userData of newUsers) {
                        userData.selected = userData.selected.filter((s) =>
                            datesRef.current.includes(s)
                        );
                    }
                } else {
                    // the meetup was a time one
                    for (let dateTimeStr in loadedMeetup.selectionMap) {
                        if (!timesRef.current.includes(dateTimeStr)) {
                            delete newSelectionMap[dateTimeStr];
                        }
                    }
                    for (let userData of newUsers) {
                        console.log("before", userData.selected);
                        userData.selected = userData.selected.filter((s) =>
                            timesRef.current.includes(s)
                        );
                        console.log("after", userData.selected);
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
                },
                users: newUsers,
                // creatorInfoMessageId: 0,
            };

            console.log({ MeetupData });

            update(meetupId, MeetupData)
                .then((res) => {
                    disableButton();
                    // TODO: update the loaded meetup
                    setUserCanSubmit(false);
                    loadedMeetup = res;
                })
                .catch((e) => {
                    alert(e);
                });

            // create(MeetupData)
            //     .then((res) => {
            //         // send the ID back to Telegram
            //         // webApp?.sendData(res.id)
            //         // webApp?.close()
            //         const newDocId = res.id;
            //         webApp?.switchInlineQuery(titleRef.current, [
            //             "users",
            //             "groups",
            //             "channels",
            //             "bots",
            //         ]);
            //         webApp?.close();
            //     })
            //     .catch((e) => {
            //         alert("somme error!!");
            //     });
        };
        if (webApp) {
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
                            submitUpdate();
                        } else {
                            return;
                        }
                    }
                );
            } else {
                submitUpdate();
            }
        }

        return;
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

    if (!user || !loadedMeetup) {
        if (userId !== loadedMeetup?.creator.id) {
            return <>You do not have access to edit this meetup</>;
        }
    }

    return (
        <FormControl>
            <Stack spacing={4}>
                <Heading fontSize={"xl"}> Edit event </Heading>
                <Input
                    id="title"
                    placeholder="Event title (required)"
                    required
                    value={title}
                    onChange={onTitleChange}
                />
                <Textarea
                    id="description"
                    placeholder="Event description (optional)"
                    value={description}
                    onChange={onDescriptionChange}
                />
                <Box>
                    <Heading fontSize={"xl"} pt={6}>
                        {" "}
                        Select the possible event dates{" "}
                    </Heading>

                    <HelperText>
                        {" "}
                        {isMobile ? "Touch / Touch" : "Click / click"} and drag
                        to select.
                    </HelperText>
                </Box>
                <Alert status="warning">
                    <AlertIcon />
                    Please note that removing a date or time that people have
                    indicated WILL remove their indication as well!
                </Alert>

                <CalendarContainer
                    datesSelected={datesRef.current}
                    setDatesSelected={setDatesSelected}
                    onStop={onStop}
                />

                <Heading fontSize={"xl"} pt={6}>
                    {" "}
                    Select the possible event timings{" "}
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
                        timeInitiallyOpen={!isFullDay}
                    />
                </Collapse>

                <Box>
                    <Heading fontSize={"xl"} pt={6}>
                        Advanced settings
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
                <Flex justifyContent={"space-between"} alignItems="center">
                    <Box>
                        <Text>
                            {" "}
                            Send a notification when number of users hits:{" "}
                        </Text>
                        <HelperText> Default: No notification </HelperText>
                    </Box>
                    <Box>
                        <InputGroup size="sm">
                            <NumberInput
                                width="72px"
                                value={notificationThreshold}
                                onChange={(e) => {
                                    setNotificationThreshold(parseInt(e));
                                    setUserCanSubmit(true);
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
                                    setUserCanSubmit(true);
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
                        <Text> Limit the number of users per slot to: </Text>
                        <HelperText> Default: No limit </HelperText>
                    </Box>
                    <Box>
                        <InputGroup size="sm">
                            <NumberInput
                                width="72px"
                                value={limitPerSlot}
                                onChange={(e) => {
                                    setUserCanSubmit(true);
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
            </Stack>
        </FormControl>
    );
};
export default MeetupEditPage;
