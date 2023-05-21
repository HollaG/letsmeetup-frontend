import {
    Button,
    Center,
    Divider,
    Heading,
    Input,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { SelectionEvent } from "@viselect/react";
import React, { useEffect, useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import useStateRef from "react-usestateref";
import ByDateList from "../components/AvailabilityList/ByDateList";
import ByTimeList from "../components/AvailabilityList/ByTimeList";
import CalendarDisplay from "../components/AvailabilityList/CalendarDisplay";
import ColorExplainer from "../components/AvailabilityList/common/ColorExplainer";
import CalendarContainer, {
    dateParser,
} from "../components/Calendar/CalendarContainer";
import { CellData } from "../components/Time/TimeContainer";
import TimeSelector from "../components/Time/TimeSelector";
import { useTelegram } from "../context/TelegramProvider";
import { Meetup, updateAvailability } from "../db/repositories/meetups";
import useFirestore from "../hooks/firestore";
import { ITelegramUser } from "../types/telegram";
import { TimeSelection } from "../types/types";

let tempUser: ITelegramUser = {
    id: 8995652501,
    first_name: "Vlad",
    last_name: "Kruglikov",
    username: "vkruglikov",
    language_code: "en",
};

/**
 * Swaps the format of encoded string from [minutes]::[date] to [date]::[minutes] if :: is present
 *
 * @param time the string to swap
 *
 * @returns the swapped string
 */
export const swapDateTimeStr = (time: string) => {
    if (time.includes("::")) {
        const [minutes, date] = time.split("::");
        return `${date}::${minutes}`;
    } else {
        return time;
    }
};

/**
 * Removes the header minute part of a encoded string, if it exists.
 *
 * Example input: 540::2021-12-03 --> 2021-12-03
 *                2021-12-03 --> 2021-12-03
 *
 * @param time the string to clean
 * @returns The date string
 */
export const removeTime = (time: string) => {
    if (time.includes("::")) {
        return time.split("::")[1];
    } else {
        return time;
    }
};

/**
 * Removes the date part of a encoded string, if it exists.
 *
 * Example input: 540::2021-12-03 --> 2021-12-03
 *                2021-12-03 --> 2021-12-03
 *
 * @param time the string to clean
 * @returns The date string
 */
export const removeDate = (time: string) => {
    if (time.includes("::")) {
        return Number(time.split("::")[0]);
    } else {
        return Number(time);
    }
};

const MeetupPage = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    const firestore = useFirestore();
    const [document, setDocument] = useState();

    let { meetupId } = useParams<{
        meetupId: string;
    }>() as { meetupId: string };
    const { meetup: loadedMeetup } = useLoaderData() as { meetup: Meetup };

    const [meetup, setMeetup] = useState<Meetup>(loadedMeetup);
    const [liveMeetup, setLiveMeetup] = useState<Meetup>(loadedMeetup);
    // TEMPORARY: OVERRIDE USER ID
    let { user, webApp } = useTelegram();

    const [_, setWebAppRef, webAppRef] = useStateRef(webApp);

    useEffect(() => {
        setWebAppRef(webApp);
    }, [webApp]);

    if (!user) user = tempUser;

    /**
     * Subscribe to changes in the document.
     *
     * Call the unscribe function when the component unmounts.
     */
    useEffect(() => {
        if (!meetupId) return;
        const unsubscribe = firestore.getDocument(meetupId || "", {
            next: (doc) => {
                console.log(doc.data(), "---doc changed---");
                setLiveMeetup(doc.data() as Meetup);
            },
        });
        return () => {
            unsubscribe();
        };
    }, []);

    // console.log({ meetup });

    /**
     * Initalize the dates and times selected to what the user has already selected, if there is any
     */
    const [datesSelected, setDatesSelected, datesRef] = useStateRef<string[]>(
        [
            ...new Set(
                meetup.users
                    .find((u) => u.user.id === user?.id)
                    ?.selected.map(removeTime)
            ),
        ].sort() || []
    );

    const [timesSelected, setTimesSelected, timesRef] =
        useStateRef<TimeSelection>(
            meetup.users.find((u) => u.user.id === user?.id)?.selected || []
        );

    const startDate = dateParser(meetup.dates.sort()[0]);
    const endDate = dateParser(meetup.dates.sort()[meetup.dates.length - 1]);

    const times = [...new Set(meetup.timeslots.map(removeDate))].sort(
        (a, b) => a - b
    );

    const startMin = meetup.timeslots.length ? times[0] : 0;
    const endMin = meetup.timeslots.length
        ? times[times.length - 1] + 30 // add 30 because the value gotten is the START of the 30-min slot
        : 24 * 60;

    /**
     * Checks if a cell has been selected
     *
     * @param data the data of the cell that was clicked on
     * @returns true if cell has been selected, false if not.
     */
    const isSelectedCell = (data: CellData) => {
        return timesSelected.includes(`${data.value}`);
    };

    /**
     * Generates the correct classname for a cell
     *
     * @param data the data of the cell that was clicked on
     * @returns the appropiate classname for the cell
     */
    const classNameGenerator = (data: CellData) => {
        let str = "selectable time";
        if (isSelectedCell(data)) str += " selected";
        return str;
    };

    /**
     * Convert a list of elements into their IDs
     *
     * @param els List of elements to extract the ids from
     * @returns IDs
     */
    const extractIds = (els: Element[]): string[] =>
        els
            .map((v) => v.getAttribute("data-key"))
            .filter(Boolean)
            .map(String);

    /**
     * Tracks the previous times selected for comparison against when we
     * add / remove items by dragging
     *
     * Note: remember to update it with the new datesSelected when onStop() is called.
     */
    const [
        previousTimesSelected,
        setPreviousTimesSelected,
        previousTimesSelectedRef,
    ] = useStateRef<string[]>([...timesSelected]);
    /**
     * The type of drag selection.
     * 0: none
     * 1: adding
     * 2: remove
     *
     * Note: remember to reset it when onStop().
     */
    const [dragType, setDragType, dragTypeRef] = useStateRef(0);

    /**
     * Runs before Time selection to reset the store because the library doesn't handle pre-selected items well
     *
     * @param store The store of the selection event
     * @returns
     */
    const onBeforeStartTime = ({ event, selection }: SelectionEvent) => {
        // selection.
        selection.clearSelection(true, true);
        selection.select(".selectable.selected.time", true);
        if ((event?.target as HTMLElement)?.className.includes("blocked")) {
            return false;
        } else {
            // selection.select(".selectable.selected");
            return true;
        }
        // return true;
    };

    /**
     * Runs before Date selection to reset the store because the library doesn't handle pre-selected items well
     *
     * @param store The store of the selection event
     * @returns
     */
    const onBeforeStartDate = ({ event, selection }: SelectionEvent) => {
        selection.clearSelection(true, true);
        selection.select(".selectable.selected.date", true);
        // if ((event?.target as HTMLElement)?.className.includes("blocked")) {
        //     return false;
        // } else {
        //     // selection.select(".selectable.selected");
        //     return true;
        // }
        return true;
    };
    /**
     * Fired everytime the mouse is moved
     *
     * @param param0 The store of the selection event
     */
    const onMoveTime = ({
        store: {
            changed: { added, removed },
        },
    }: SelectionEvent) => {
        // setTimesSelected((prev) => {
        //     const next = new Set(prev);
        //     extractIds(added).forEach((id) => next.add(id));
        //     extractIds(removed).forEach((id) => next.delete(id));
        //     return [...next];
        // });
        if (removed.length) {
            // we are in remove mode
            if (dragTypeRef.current == 0) {
                setDragType(2);
            }
        } else if (added.length) {
            // if something was added and it's the first item, set the mode to "select" mode.
            // in this case, do not deselect anything
            if (dragTypeRef.current == 0) {
                setDragType(1);
            }
        }

        // console.log(previousTimesSelectedRef.current);
        if (dragTypeRef.current == 1) {
            // console.log("IN ADD MODE");

            setTimesSelected((prev) => {
                const startNum = prev.length;
                const next = new Set(prev);
                extractIds(added).forEach((id) => next.add(id));

                // only de-select if it was not present in previousDatesSelected
                extractIds(removed)
                    .filter(
                        (i) => !previousTimesSelectedRef.current.includes(i)
                    )
                    .forEach((id) => next.delete(id));

                const endNum = next.size;

                if (startNum != endNum) {
                    if (webAppRef.current?.HapticFeedback.selectionChanged) {
                        webAppRef.current.HapticFeedback.selectionChanged();
                    }
                }
                return [...next].sort();
            });
        } else if (dragTypeRef.current == 2) {
            // console.log("IN DELETEMODE");
            setTimesSelected((prev) => {
                const startNum = prev.length;
                const next = new Set(prev);
                // only re-select if it was present in previousDatesSelected
                extractIds(added)
                    .filter((i) => previousTimesSelectedRef.current.includes(i))
                    .forEach((id) => next.add(id));
                extractIds(removed).forEach((id) => next.delete(id));
                const endNum = next.size;

                if (startNum != endNum) {
                    if (webAppRef.current?.HapticFeedback.selectionChanged) {
                        webAppRef.current.HapticFeedback.selectionChanged();
                    }
                }
                return [...next].sort();
            });
        }
    };

    /**
     * Called when the user stops entering time and date data.
     *
     * Note: the state is stale when doing callbacks.
     * @see https://stackoverflow.com/a/63039797
     * @see https://www.npmjs.com/package/react-usestateref
     */
    const onStopDate = () => {
        // TODO: there needs to be a user here
        // updateAvailability(meetupId, user || tempUser, {
        //     datesSelected: datesRef.current,
        //     timesSelected: timesRef.current.filter((t) =>
        //         datesRef.current.includes(removeTime(t))
        //     ),
        // });
        setHasDataChanged(true);
        // onSubmit()
    };

    /**
     * Called when the user stops entering time and date data.
     *
     * Note: the state is stale when doing callbacks.
     * @see https://stackoverflow.com/a/63039797
     * @see https://www.npmjs.com/package/react-usestateref
     */
    const onStopTime = ({ event, selection }: SelectionEvent) => {
        // TODO: there needs to be a user here
        // updateAvailability(meetupId, user || tempUser, {
        //     datesSelected: datesRef.current,
        //     timesSelected: timesRef.current.filter((t) =>
        //         datesRef.current.includes(removeTime(t))
        //     ),
        // });
        setPreviousTimesSelected(extractIds(selection.getSelection()));
        setDragType(0);
        setHasDataChanged(true);
        // onSubmit()
    };

    /**
     * Selects all available timeslots for the date range selected
     *
     * Only needed when isFullDay is false
     */
    const selectAllTimes = () => {
        const slotsToPickFrom = meetup.timeslots.filter((slot) =>
            datesRef.current.includes(removeTime(slot))
        );
        setTimesSelected(slotsToPickFrom);
        // onSubmit()
        setHasDataChanged(true);
        setPreviousTimesSelected(slotsToPickFrom);
    };

    /**
     * Deselects all timeslots
     *
     * Only needed when isFullDay is false
     */
    const deselectAllTimes = () => {
        setTimesSelected([]);
        // updateAvailability(meetupId, user || tempUser, {
        //     datesSelected: datesRef.current,
        //     timesSelected: timesRef.current,
        // });
        // onSubmit()
        setHasDataChanged(true);
        setPreviousTimesSelected([]);
    };

    /**
     * Submits the availability data to the server.
     */
    const onSubmit = async () => {
        console.log("onsubmit");
        await updateAvailability(
            meetupId,
            user || tempUser,
            {
                datesSelected: datesRef.current,
                timesSelected: timesRef.current.filter((t) =>
                    datesRef.current.includes(removeTime(t))
                ),
            },
            commentsRef.current
        );
        setHasDataChanged(false);
    };

    // Whether the user has modified any data
    const [hasDataChanged, setHasDataChanged, dataChangedRef] =
        useStateRef(false);

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
            webApp.MainButton.setText("No changes since last save.");
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
            webApp.MainButton.setText("Save your availability");
            webApp.isClosingConfirmationEnabled = true;
            // webApp.MainButton.textColor = textColor
        }
    };

    // Add the submit handler and initialize the MainButton
    useEffect(() => {
        if (webApp?.initData) {
            disableButton();
            webApp.MainButton.onClick(onSubmit);
            webApp.MainButton.isVisible = true;
        }

        return () => webApp?.MainButton.offClick(onSubmit);
    }, [webApp]);

    // Listen to when the selected data changes and update the button accordingly
    // also listen to when the theme changes (this shouldn't really happen as we will remove the change theme button)
    // TODO: maybe synchronise this to Telegram's theme?
    useEffect(() => {
        if (webApp?.initData) {
            if (!hasDataChanged) {
                disableButton();
            } else {
                enableButton();
            }
            webApp.MainButton.textColor = textColor;
        }
    }, [hasDataChanged, colorMode]);

    const [comments, setComments, commentsRef] = useStateRef<string>(
        meetup.users.find((u) => u.user.id === user?.id)?.comments || ""
    );
    /**
     * Controlled component for the comments input
     *
     * @param e the change event from the input
     */
    const commentsOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setComments(e.target.value);
        setHasDataChanged(true);
    };

    return (
        <Stack spacing={4}>
            <Heading fontSize={"xl"}> {meetup.title} </Heading>
            <Text> {meetup.description} </Text>
            <Divider />

            <Tabs isFitted>
                <TabList>
                    {webApp?.initData && <Tab> Select your availability </Tab>}
                    <Tab> View others' availability </Tab>
                </TabList>
                <TabPanels>
                    {webApp?.initData && (
                        <TabPanel>
                            <Stack spacing={4} justifyContent="left">
                                <Heading fontSize={"lg"}>
                                    Select your available dates{" "}
                                </Heading>
                                <CalendarContainer
                                    datesSelected={datesSelected}
                                    setDatesSelected={setDatesSelected}
                                    startDate={startDate}
                                    endDate={endDate}
                                    allowedDates={meetup.dates}
                                    onStop={onStopDate}
                                    onBeforeStart={onBeforeStartDate}
                                />
                                {!meetup.isFullDay && (
                                    <>
                                        <Heading fontSize={"lg"}>
                                            {" "}
                                            Select your available times{" "}
                                        </Heading>
                                        <TimeSelector
                                            classNameGenerator={
                                                classNameGenerator
                                            }
                                            datesSelected={datesRef.current}
                                            deselectAll={deselectAllTimes}
                                            endMin={endMin}
                                            startMin={startMin}
                                            isSelectedCell={isSelectedCell}
                                            selectAll={selectAllTimes}
                                            timesSelected={timesRef.current}
                                            onBeforeStart={onBeforeStartTime}
                                            onMove={onMoveTime}
                                            allowedTimes={meetup.timeslots}
                                            onStop={onStopTime}
                                        />
                                    </>
                                )}
                                <Input
                                    placeholder="Add your comments (optional)"
                                    value={comments}
                                    onChange={commentsOnChange}
                                />
                            </Stack>
                        </TabPanel>
                    )}
                    <TabPanel>
                        <Stack spacing={4} justifyContent="left">
                            <Heading fontSize="lg">
                                {" "}
                                Others' availability{" "}
                            </Heading>
                            <Center>
                                <ColorExplainer
                                    numTotal={meetup.users.length}
                                />
                            </Center>
                            <CalendarDisplay meetup={liveMeetup} />
                            {!meetup.isFullDay && (
                                <ByTimeList meetup={liveMeetup} />
                            )}
                            {meetup.isFullDay && (
                                <ByDateList meetup={liveMeetup} />
                            )}
                        </Stack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Stack>
    );
};

export default MeetupPage;
