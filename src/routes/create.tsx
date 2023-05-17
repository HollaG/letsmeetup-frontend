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
import CalendarContainer from "../components/Calendar/CalendarContainer";
import TimeContainer from "../components/Time/TimeContainer";
import TimeRangeSelector from "../components/Time/TimeRangeSelector";
import { useTelegram } from "../context/TelegramProvider";
import { create, Meetup } from "../db/repositories/meetups";
import { TimeSelection } from "../types/types";

const Create = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [datesSelected, setDatesSelected] = useState<string[]>([]);

    const [timesSelected, setTimesSelected] = useState<TimeSelection>([]);

    const [isFullDay, setIsFullDay] = useState<boolean>(false);

    const { user, webApp } = useTelegram();

    const [userCanSubmit, setUserCanSubmit] = useState<boolean>(false);
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
        console.log({ userCanSubmit });

        // Validate data
        if (!userCanSubmit) {
            return console.log("can't submit!");
        }

        const MeetupData: Meetup = {
            title,
            description,
            date_created: new Date(),
            creator: {
                user_ID: user!.id,
                first_name: user!.first_name,
                username: user!.username,
                photo_url: user!.photo_url || "",
            },
            isFullDay,
            timeslots: isFullDay ? [] : timesSelected,
            dates: datesSelected,
            users: [],
            notified: false,
        };

        console.log({ MeetupData });

        create(MeetupData)
            .then((res) => {
                // console.log(res);
                // send the ID back to Telegram
                // webApp?.sendData(res.id)
                // webApp?.close()
                const newDocId = res.id;
                webApp?.switchInlineQuery(`share_${newDocId}`, ['users', 'groups', 'channels'] )
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
            console.log("updating onSubmit");
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
            />
            <Heading fontSize={"xl"} pt={6}>
                {" "}
                Select the possible event timings{" "}
            </Heading>
            <Flex direction={"row"} justifyContent="space-between">
                <Text> Set as full day </Text>
                <Switch
                    isChecked={isFullDay}
                    onChange={(e) => setIsFullDay(e.target.checked)}
                />
            </Flex>
            <Collapse in={!isFullDay}>
                <TimeContainer
                    datesSelected={datesSelected}
                    setTimesSelected={setTimesSelected}
                    timesSelected={timesSelected}
                />
            </Collapse>
        </Stack>
    );
};

export default Create;
