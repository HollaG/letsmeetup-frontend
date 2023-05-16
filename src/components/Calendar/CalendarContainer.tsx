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

/**
 * Contains everything related to the calendar.
 *
 * See https://github.com/chakra-ui/chakra-ui/issues/7269 for disabling buttons
 *
 * @returns the component containing everything related to the calendar
 */
const CalendarContainer: React.FC = () => {
    const currentMonthNum = new Date().getMonth();
    const [drawnDays, setDrawnDays] = useState<CalendarDayProps[]>([]);

    const firstDateInMonth = parse(
        `${1}-${currentMonthNum + 1}-${new Date().getFullYear()}`,
        "d-MM-yyyy",
        new Date()
    );

    const [selectedDate, setSelectedDate] = useState<Date>(firstDateInMonth);

    useEffect(() => {
        const d = new Date();

        const currentMonthNum = selectedDate.getMonth();
        const currentYearNum = d.getFullYear();

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

    const canGoLeft = isAfter(selectedDate, new Date());
    const canGoRight = isBefore(selectedDate, addMonths(new Date(), 11));

    const goLeft = () => {
        // Disable go-left if the next month will be in the past
        if (!canGoLeft) return;
        setSelectedDate((prev) => subMonths(prev, 1));
    };

    const goRight = () => {
        // disable go-right if the next month is 1 year from now
        if (!canGoRight) return;
        setSelectedDate((prev) => addMonths(prev, 1));
    };

    /**
     * 0 = click-and-drag
     * 1 = range-select
     */
    const [selectMode, setSelectMode] = useState<0 | 1>(0);
    // const [datesSelected, setDatesSelected] = useState<Date[]>([]);
    const [datesSelected, setDatesSelected] = useState<string[]>([]);

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

    const onMove = ({
        store: {
            changed: { added, removed },
        },
    }: SelectionEvent) => {
        setDatesSelected((prev) => {
            const next = new Set(prev);
            extractIds(added).forEach((id) => next.add(id));
            extractIds(removed).forEach((id) => next.delete(id));
            return [...next];
        });
    };

    const onStop = ({ event, selection }: SelectionEvent) =>
        setIsDragging(false);



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
                return [...next];
            });
        },
        [isDragging]
    );

    return (
        <Stack>
            <Flex justifyContent={"center"}>
                <Button
                    size="xs"
                    isDisabled={!canGoLeft}
                    onClick={goLeft}
                    aria-label="Previous month"
                >
                    {" "}
                    &lt;{" "}
                </Button>
                <Text data-testid="month-display" mx={4}>
                    {" "}
                    {format(selectedDate, "MMM yyyy")}
                </Text>
                <Button
                    size="xs"
                    onClick={goRight}
                    isDisabled={!canGoRight}
                    aria-label="Next month"
                >
                    {" "}
                    &gt;{" "}
                </Button>
            </Flex>
            <SelectionArea
                className="select-container"
                onStart={onStart}
                onMove={onMove}
                onStop={onStop}
                selectables=".selectable"
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
                <Grid templateColumns="repeat(7, 1fr)" gap={0}>
                    <CalendarHeader />
                    <CalendarBody
                        drawnDays={drawnDays}
                        onTouchEnd={onTouchEnd}
                        datesSelected={datesSelected}
                    />
                </Grid>
            </SelectionArea>
        </Stack>
    );
};

export default React.memo(CalendarContainer);
