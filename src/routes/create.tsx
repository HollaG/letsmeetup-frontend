import {
    Box,
    Button,
    Collapse,
    Container,
    Flex,
    FormHelperText,
    Heading,
    Input,
    Stack,
    Switch,
    Text,
    Textarea,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useStateRef from "react-usestateref";
import CalendarContainer from "../components/Calendar/CalendarContainer";
import HelperText from "../components/Display/HelperText";
import TimeContainer, {
    create30MinuteIncrements,
} from "../components/Time/TimeContainer";
import TimeRangeSelector from "../components/Time/TimeRangeSelector";
import { useTelegram } from "../context/TelegramProvider";
import { create, Meetup } from "../db/repositories/meetups";
import { TimeSelection } from "../types/types";

const Create = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    const [title, setTitle, titleRef] = useStateRef<string>("");
    const [description, setDescription, descriptionRef] =
        useStateRef<string>("");

    const [datesSelected, setDatesSelected, datesRef] = useStateRef<string[]>(
        []
    );

    const [timesSelected, setTimesSelected, timesRef] =
        useStateRef<TimeSelection>([]);

    const [isFullDay, setIsFullDay, isFullDayRef] = useStateRef<boolean>(false);

    const { user, webApp } = useTelegram();

    const [userCanSubmit, setUserCanSubmit] = useState<boolean>(false);

    const [[startMin, endMin], setTime, timeRef] = useStateRef([
        9 * 60,
        17 * 60,
    ]); // in minutes

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

    /**
     *
     * The submit handler when a user clicks Telegram's MainButton.
     *
     * Note: Runs twice for some reason.
     *
     *
     */
    const onSubmit = () => {
        // setIsSubmitting(true);
        console.log("submitting data or smt");
        // webApp?.MainButton.showProgress(false);

        // Validate data
        if (!userCanSubmit) {
            return console.log("can't submit!");
        }

        const MeetupData: Meetup = {
            title: titleRef.current,
            description: descriptionRef.current,
            date_created: new Date(),
            creator: {
                id: user!.id,
                first_name: user!.first_name,
                username: user!.username,
                photo_url: user!.photo_url || "",
            },
            isFullDay,
            timeslots: isFullDayRef.current ? [] : timesRef.current,
            dates: datesRef.current,
            users: [],
            notified: false,
            selectionMap: {},
            messages: [],
        };

        console.log({ MeetupData });

        create(MeetupData)
            .then((res) => {
                // console.log(res);
                // send the ID back to Telegram
                // webApp?.sendData(res.id)
                // webApp?.close()
                const newDocId = res.id;
                webApp?.switchInlineQuery(title, [
                    "users",
                    "groups",
                    "channels",
                    "bots",
                ]);
                webApp?.close();
            })
            .catch((e) => {
                alert("somme error!!");
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
            // console.log("updating onSubmit");
            webApp.MainButton.onClick(onSubmit);
        }
    }, [webApp, userCanSubmit]);

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

    const btnColor = useColorModeValue("#90CDF4", "#2C5282");
    const disabledBtnColor = useColorModeValue("#EDF2F7", "#1A202C");
    const textColor = useColorModeValue("#000000", "#ffffff");
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
            // webApp.MainButton.textColor = textColor
        }
    };

    // TODO: maybe synchronise theme this to Telegram's theme?

    return (
        <Stack spacing={4}>
            <Heading fontSize={"xl"}> Create a new event </Heading>
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
                    {isMobile ? "Touch / Touch" : "Click / click"} and drag to
                    select.
                </HelperText>
            </Box>

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
        </Stack>
    );
};

export default Create;
