import { Button, Divider, Heading, Stack, Text, useColorMode } from "@chakra-ui/react";
import { SelectionEvent } from "@viselect/react";
import { useEffect, useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import useStateRef from "react-usestateref";
import ByTimeList from "../components/AvailabilityList/ByTimeList";
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
const removeTime = (time: string) => {
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

    const { meetupId } = useParams();
    const { meetup: loadedMeetup } = useLoaderData() as { meetup: Meetup };

    const [meetup, setMeetup] = useState<Meetup>(loadedMeetup);
    const [liveMeetup, setLiveMeetup] = useState<Meetup>(loadedMeetup);
    // TEMPORARY: OVERRIDE USER ID
    let { user, webApp } = useTelegram();
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

    if (!meetupId) return <> No meetup ID specified </>;

    const startDate = dateParser(meetup.dates.sort()[0]);
    const endDate = dateParser(meetup.dates.sort()[meetup.dates.length - 1]);

    const times = [...new Set(meetup.timeslots.map(removeDate))].sort();

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
     * Runs before Time selection to reset the store because the library doesn't handle pre-selected items well
     *
     * @param store The store of the selection event
     * @returns
     */
    const onBeforeStart = ({ event, selection }: SelectionEvent) => {
        // selection.
        selection.clearSelection(true, true);
        selection.select(".selectable.selected.time", true);
        if ((event?.target as HTMLElement)?.className.includes("blocked")) {
            return false;
        } else {
            // selection.select(".selectable.selected");
            return true;
        }
    };

    /**
     * Fired everytime the mouse is moved
     *
     * @param param0 The store of the selection event
     */
    const onMove = ({
        store: {
            changed: { added, removed },
        },
    }: SelectionEvent) => {
        setTimesSelected((prev) => {
            const next = new Set(prev);
            extractIds(added).forEach((id) => next.add(id));
            extractIds(removed).forEach((id) => next.delete(id));
            return [...next];
        });
    };

    /**
     * Called when the user stops entering time and date data.
     *
     * Note: the state is stale when doing callbacks.
     * @see https://stackoverflow.com/a/63039797
     * @see https://www.npmjs.com/package/react-usestateref
     */
    const onStop = () => {
        // TODO: there needs to be a user here
        updateAvailability(meetupId, user || tempUser, {
            datesSelected: datesRef.current,
            timesSelected: timesRef.current.filter((t) =>
                datesRef.current.includes(removeTime(t))
            ),
        });
    };

    /**
     * Runs before Date selection to reset the store because the library doesn't handle pre-selected items well
     *
     * @param store The store of the selection event
     * @returns
     */
    const onBeforeDatesStart = ({ event, selection }: SelectionEvent) => {
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
     * Selects all available timeslots for the date range selected
     *
     * Only needed when isFullDay is false
     */
    const selectAllTimes = () => {
        const slotsToPickFrom = meetup.timeslots.filter((slot) =>
            datesRef.current.includes(removeTime(slot))
        );
        setTimesSelected(slotsToPickFrom);
        updateAvailability(meetupId, user || tempUser, {
            datesSelected: datesRef.current,
            timesSelected: timesRef.current,
        });
    };

    /**
     * Deselects all timeslots
     *
     * Only needed when isFullDay is false
     */
    const deselectAllTimes = () => {
        setTimesSelected([]);
        updateAvailability(meetupId, user || tempUser, {
            datesSelected: datesRef.current,
            timesSelected: timesRef.current,
        });
    };

    // Preprocess
    // for

    // console.log({ startMin, endMin });
    return (
        <Stack spacing={4}>
            <Button onClick={toggleColorMode}> toggle mode </Button>
            
            <Heading fontSize={"xl"}> {meetup.title} </Heading>
            <Text> {meetup.description} </Text>
            <Divider />
            <Heading fontSize={"lg"}> Select your available dates </Heading>
            <CalendarContainer
                datesSelected={datesSelected}
                setDatesSelected={setDatesSelected}
                startDate={startDate}
                endDate={endDate}
                allowedDates={meetup.dates}
                onStop={onStop}
                onBeforeStart={onBeforeDatesStart}
            />
            {!meetup.isFullDay && (
                <>
                    <Heading fontSize={"lg"}>
                        {" "}
                        Select your available times{" "}
                    </Heading>
                    <TimeSelector
                        classNameGenerator={classNameGenerator}
                        datesSelected={datesSelected}
                        deselectAll={deselectAllTimes}
                        endMin={endMin}
                        startMin={startMin}
                        isSelectedCell={isSelectedCell}
                        selectAll={selectAllTimes}
                        timesSelected={timesSelected}
                        onBeforeStart={onBeforeStart}
                        onMove={onMove}
                        allowedTimes={meetup.timeslots}
                        onStop={onStop}
                    />
                </>
            )}

            {!meetup.isFullDay && (
                <>
                    <Heading fontSize='lg'> Others' availability </Heading>
                    <ByTimeList meetup={liveMeetup}/>
                </>
            )}

        </Stack>
    );
};

export default MeetupPage;
