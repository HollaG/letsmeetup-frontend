import {
    Button,
    Collapse,
    Container,
    Flex,
    Heading,
    Input,
    Stack,
    Switch,
    Text,
    useColorMode,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import useStateRef from "react-usestateref";
import CalendarContainer from "../components/Calendar/CalendarContainer";
import TimeContainer, {
    create30MinuteIncrements,
} from "../components/Time/TimeContainer";
import TimeRangeSelector from "../components/Time/TimeRangeSelector";
import { useTelegram } from "../context/TelegramProvider";
import { create, Meetup } from "../db/repositories/meetups";
import { TimeSelection } from "../types/types";

const Create = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [datesSelected, setDatesSelected, datesRef] = useStateRef<string[]>(
        []
    );

    const [timesSelected, setTimesSelected, timesRef] =
        useStateRef<TimeSelection>([]);

    const [isFullDay, setIsFullDay] = useState<boolean>(false);

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
        console.log(userCanSubmit);
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
            title,
            description,
            date_created: new Date(),
            creator: {
                id: user!.id,
                first_name: user!.first_name,
                username: user!.username,
                photo_url: user!.photo_url || "",
            },
            isFullDay,
            timeslots: isFullDay ? [] : timesRef.current,
            dates: datesRef.current,
            users: [],
            notified: false,
            selectionMap: {},
        };

        console.log({ MeetupData });

        
        create(MeetupData)
            .then((res) => {
                // console.log(res);
                // send the ID back to Telegram
                // webApp?.sendData(res.id)
                // webApp?.close()
                const newDocId = res.id;
                webApp?.switchInlineQuery(`share_${newDocId}`, [
                    "users",
                    "groups",
                    "channels",
                    "bots",
                ]);
            })
            .catch((e) => {
                alert("somme error!!");
            });
    };

   

    /**
     * Initialize button at bottom of screen
     */
    useEffect(() => {
        if (webApp) {
            webApp.MainButton.isVisible = true;
            webApp.MainButton.text = "Create";

            webApp.MainButton.disable();
        }
    }, [webApp, webApp?.MainButton]);

    /**
     * Handle dynamic updates
     */
    useEffect(() => {
        if (webApp) {
            if (userCanSubmit) {
                webApp.MainButton.enable();
            } else {
                webApp.MainButton.disable();
            }
            // console.log("updating onSubmit");
            webApp.MainButton.onClick(onSubmit);
        }

        return () => {
            webApp && webApp.MainButton.offClick(onSubmit);
        };
    }, [
        webApp,
        userCanSubmit,
        title,
        description,
        datesSelected,
        timesSelected,
        isFullDay,
    ]);

    /**
     * Automatically add the times from 9 - 5 based on the dates if the user has not selected a day
     *
     * Pristine refers to whether the 'set individual date times' switch has been touched.
     */
    const [pristine, setPristine, pristineRef] = useStateRef<boolean>(true);
    const onStop = () => {
        if (pristineRef.current) {                  
            console.log("hello very much");
            const flat = create30MinuteIncrements(timeRef.current[0], timeRef.current[1])
            setTimesSelected(flat.flatMap(time => datesRef.current.map(date => `${time}::${date}`)));
        }
    };

    return (
        <Stack spacing={4}>
            <Button onClick={toggleColorMode}> toggle mode </Button>
            <Heading fontSize={"xl"}> Create a new event </Heading>
            <Input
                id="title"
                placeholder="Event title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <Input
                id="description"
                placeholder="Event description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Heading fontSize={"xl"} pt={6}>
                {" "}
                Select the possible event dates{" "}
            </Heading>

            <CalendarContainer
                datesSelected={datesSelected}
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
                    datesSelected={datesSelected}
                    setTimesSelected={setTimesSelected}
                    timesSelected={timesSelected}
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
