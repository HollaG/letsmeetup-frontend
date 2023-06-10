/**
 * Contains the whole Calendar component.
 */
import {
    Button,
    Flex,
    Grid,
    GridItemProps,
    Select,
    Stack,
    Text,
} from "@chakra-ui/react";
import SelectionArea, { SelectionEvent } from "@viselect/react";
import {
    addYears,
    format,
    isBefore,
    isSameDay,
    parse,
    subMonths,
} from "date-fns";
import { addDays, addMonths, isAfter, subDays } from "date-fns/esm";
import React, { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";
import useStateRef from "react-usestateref";
import { useTelegram } from "../../context/TelegramProvider";
import CalendarBody from "./CalendarBody";
import CalendarHeader from "./CalendarHeader";

export const CalendarGridItemProps: GridItemProps = {};

export type CalendarDayProps = {
    text: string;
    date: Date;
};

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

/**
 * Parses the date string into a Date object using the standard ISO date format.
 *
 * @param dateStr the string to be parsed
 * @returns Date object
 */
export const dateParser = (dateStr: string) => {
    return parse(dateStr, "yyyy-MM-dd", new Date());
};

/**
 * Encodes the date object into a string using the standard ISO date format.
 *
 * @param date the date object to be encoded
 * @returns string
 *
 */
export const dateEncoder = (date: Date) => {
    return format(date, "yyyy-MM-dd");
};

type CalendarContainerProps = {
    setDatesSelected: React.Dispatch<React.SetStateAction<string[]>>;
    datesSelected: string[];
    startDate?: Date; // the start date of the calendar. Defaults to today
    endDate?: Date; // the end date of the calendar. Defaults to 1 year from today
    allowedDates?: string[];
    onStop?: ({ event, selection }: SelectionEvent) => void;
    onBeforeStart?: ({ event, selection }: SelectionEvent) => void;
};

/**
 * Contains everything related to the calendar.
 *
 * See https://github.com/chakra-ui/chakra-ui/issues/7269 for disabling buttons
 *
 * @returns the component containing everything related to the calendar
 */
const CalendarContainer = ({
    datesSelected,
    setDatesSelected,
    startDate = new Date(),
    endDate = addMonths(new Date(), 12),
    allowedDates,
    onStop,
    onBeforeStart,
}: CalendarContainerProps) => {
    const [drawnDays, setDrawnDays] = useState<CalendarDayProps[]>([]);
    const { user, webApp } = useTelegram();
    const [_, setWebAppRef, webAppRef] = useStateRef(webApp);

    useEffect(() => {
        setWebAppRef(webApp);
    }, [webApp]);

    // if startDate is specified, the 'selectedDate' should be the first day of the month of the startDate
    const initialDateSelected = parse(
        `${1}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`,
        "d-MM-yyyy",
        new Date()
    );

    const [selectedDate, setSelectedDate, selectedDateRef] =
        useStateRef<Date>(initialDateSelected);

    useEffect(() => {
        const d = new Date();

        const currentMonthNum = selectedDate.getMonth();
        const currentYearNum = selectedDate.getFullYear();

        // construct the first row
        // get the dayOfWeek for the first day in this month
        const firstDateInMonth = parse(
            `${1}-${currentMonthNum + 1}-${currentYearNum}`,
            "d-MM-yyyy",
            new Date()
        );
        const firstDayInMonth = firstDateInMonth.getDay();

        // Construct the array like so:
        let tempArray: CalendarDayProps[] = [];

        let lookBackDays = firstDayInMonth; // The number of days to go 'backwards' because we need to fill up the calendar rows

        let lbd = firstDateInMonth;
        while (lookBackDays > 0) {
            lookBackDays = lookBackDays - 1;
            lbd = subDays(lbd, 1);

            tempArray.push({
                date: lbd,
                text: format(lbd, "d"),
            });
        }

        // because we go backwards, we need to reverse the array
        tempArray = tempArray.reverse();

        // add the rest of the days in this month
        let lfd = firstDateInMonth;
        while (lfd.getMonth() == currentMonthNum) {
            // while we're in the current month
            tempArray.push({
                date: lfd,
                text: format(lfd, "d"),
            });
            lfd = addDays(lfd, 1);
        }

        // add the 'overflow' days
        while (tempArray.length % 7 != 0) {
            tempArray.push({
                date: lfd,
                text: format(lfd, "d"),
            });
            lfd = addDays(lfd, 1);
        }

        setDrawnDays(tempArray);
    }, [selectedDate]);

    const canGoLeft = isAfter(selectedDate, startDate);
    const canGoRight = isBefore(addMonths(selectedDate, 1), endDate);

    const goLeft = () => {
        // Disable go-left if the next month will be in the past
        if (!canGoLeft) return;

        setSelectedDate((prev) => subMonths(prev, 1));
        // skip months that are not in allowedDates.
        // check if `allowedDates` has any dates that are in the previous month
        if (allowedDates) {
            let hasOneDateInPreviousMonth = false;
            const prevMonthNum = selectedDateRef.current.getMonth();
            for (let allowedDate of allowedDates) {
                const allowedDateObj = dateParser(allowedDate);
                if (allowedDateObj.getMonth() == prevMonthNum) {
                    hasOneDateInPreviousMonth = true;
                    break;
                }
            }
            if (hasOneDateInPreviousMonth) {
            } else {
                goLeft();
            }
        }
    };

    const goRight = async () => {
        // disable go-right if the next month is 1 year from now
        if (!canGoRight) return;
        setSelectedDate((prev) => addMonths(prev, 1));

        if (allowedDates) {
            let hasOneDateInNextMonth = false;
            // Use the ref object so that we get access to the already updated value
            const prevMonthNum = selectedDateRef.current.getMonth();
            for (let allowedDate of allowedDates) {
                const allowedDateObj = dateParser(allowedDate);
                if (allowedDateObj.getMonth() == prevMonthNum) {
                    console.log("has one");
                    hasOneDateInNextMonth = true;
                    break;
                }
            }
            if (hasOneDateInNextMonth) {
            } else {
                goRight();
            }
        }
    };

    const [isDragging, setIsDragging] = useState(false);

    /**
     * Extracts the IDs from an array of elements.
     *
     * @param els the array of elements to extract the ID from
     * @returns an array of IDs
     */
    const extractIds = (els: Element[]): string[] =>
        els
            .map((v) => v.getAttribute("data-key"))
            .filter(Boolean)
            .map(String);

    const onStart = ({ event, selection }: SelectionEvent) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            selection.clearSelection(false);
            // setDatesSelected(() => [...new Set<Date>()]);
        }
        setIsDragging(true);
    };

    /**
     * Tracks the previous dates selected for comparison against when we
     * add / remove items by dragging
     *
     * Note: remember to update it with the new datesSelected when onStop() is called.
     */
    const [
        previousDatesSelected,
        setPreviousDatesSelected,
        previousDatesSelectedRef,
    ] = useStateRef<string[]>([...datesSelected]);

    /**
     * The type of drag selection.
     * 0: none
     * 1: adding
     * 2: remove
     *
     * Note: remember to reset it when onStop().
     */
    const [dragType, setDragType, dragTypeRef] = useStateRef(0);
    const onMove = ({
        store: {
            changed: { added, removed },
        },
    }: SelectionEvent) => {
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

        if (dragTypeRef.current == 1) {
            // console.log("IN ADD MODE");

            setDatesSelected((prev) => {
                const startNum = prev.length;
                const next = new Set(prev);
                extractIds(added).forEach((id) => next.add(id));

                // only de-select if it was not present in previousDatesSelected
                extractIds(removed)
                    .filter(
                        (i) => !previousDatesSelectedRef.current.includes(i)
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
            setDatesSelected((prev) => {
                const next = new Set(prev);
                const startNum = prev.length;
                // only re-select if it was present in previousDatesSelected
                extractIds(added)
                    .filter((i) => previousDatesSelectedRef.current.includes(i))
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

    // TODO: Check if this is really necessary
    const _onStop = (store: SelectionEvent) => {
        // console.log("onstop");
        onStop && onStop(store);
        setIsDragging(false);
        setDragType(0);

        setPreviousDatesSelected(extractIds(store.selection.getSelection()));
    };

    /**
     * Updates datesSelected when a date is clicked.
     * Don't update it if the user is dragging.
     *
     * This bypasses the library's requirement to touch and hold on mobile to select something.
     *
     * @param dateStr The date of the element that the touch was released on
     */
    const onTouchEnd = useCallback(
        (e: React.TouchEvent<HTMLDivElement>, dateStr: string) => {
            if (isDragging) return;
            e.stopPropagation();

            setDatesSelected((prev) => {
                const next = new Set(prev);
                if (prev.includes(dateStr)) next.delete(dateStr);
                else next.add(dateStr);
                return [...next].sort();
            });
        },
        [isDragging]
    );

    const tempBefStart = (e: SelectionEvent) => {
        // console.log("setting temp", tempRef.current);
        // setTemp((prev) => !prev);
        // // console.log(e.store.changed);
        // // return false;
        // if (e.store.changed.added) {
        // }
        // console.log(e.selection.getSelection(), "<--");
        e.selection.clearSelection(true, true);
        e.selection.select(".selectable.selected.date", true);
        onBeforeStart && onBeforeStart(e);
    };

    return (
        <Stack data-testid="calendar-component">
            <Flex justifyContent={"center"}>
                <Button
                    size="xs"
                    isDisabled={!canGoLeft}
                    onClick={goLeft}
                    aria-label="Previous month"
                    // className="override-button-color"
                >
                    {" "}
                    &lt;{" "}
                </Button>
                <Text
                    data-testid="month-display"
                    mx={4}
                    width="80px"
                    textAlign={"center"}
                >
                    {" "}
                    {format(selectedDate, "MMM yyyy")}
                </Text>
                <Button
                    size="xs"
                    onClick={goRight}
                    isDisabled={!canGoRight}
                    aria-label="Next month"
                    // className="override-button-color"
                >
                    {" "}
                    &gt;{" "}
                </Button>
            </Flex>
            <SelectionArea
                className="select-container"
                onStart={onStart}
                onMove={onMove}
                onStop={_onStop}
                onBeforeStart={tempBefStart}
                selectables=".selectable"
                features={{
                    singleTap: {
                        allow: true,
                        intersect: "touch",
                    },
                    // Enable / disable touch support.
                    touch: true,

                    // Range selection.
                    range: true,
                }}
                behaviour={{
                    overlap: "invert",
                    intersect: "touch",
                    startThreshold: 10,
                    scrolling: {
                        speedDivider: 10,
                        manualSpeed: 750,
                        startScrollMargins: {
                            x: 0,
                            y: 0,
                        },
                    },
                }}
            >
                <Grid
                    templateColumns="repeat(7, 1fr)"
                    gap={0}
                    data-testid="select-container-calendar"
                >
                    <CalendarHeader />
                    <CalendarBody
                        drawnDays={drawnDays}
                        onTouchEnd={onTouchEnd}
                        datesSelected={datesSelected}
                        startDate={startDate}
                        endDate={endDate}
                        selectedDate={selectedDate}
                        allowedDates={allowedDates}
                    />
                </Grid>
            </SelectionArea>
        </Stack>
    );
};

export default React.memo(CalendarContainer);
