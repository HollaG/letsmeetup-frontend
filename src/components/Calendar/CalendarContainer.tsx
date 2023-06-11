/**
 * Contains the whole Calendar component.
 */
import {
    Box,
    Button,
    Center,
    Flex,
    Grid,
    GridItemProps,
    Icon,
    IconButton,
    Select,
    SimpleGrid,
    Stack,
    Text,
    useMediaQuery,
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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FcPrevious } from "react-icons/fc";
import useStateRef from "react-usestateref";
import { useTelegram } from "../../context/TelegramProvider";
import { GoLeftButton, GoRightButton } from "../Buttons/NavigationButtons";
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

const getDrawnDays = (selectedDate: Date, drawOverflow: boolean) => {
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
            text: drawOverflow ? format(lbd, "d") : "", // don't render dates that are not in this month if we are showing dual calendars
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
            text: drawOverflow ? format(lfd, "d") : "", // don't render dates that are not in this month if we are showing dual calendars
        });
        lfd = addDays(lfd, 1);
    }

    console.log(drawOverflow, "in getDrawnDays");
    return tempArray;
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
    const [singleDrawnDays, setSingleDrawnDays] = useState<CalendarDayProps[]>(
        []
    );
    const [drawnDays, setDrawnDays] = useState<CalendarDayProps[]>([]);
    const [drawnDays2, setDrawnDays2] = useState<CalendarDayProps[]>([]);
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

    const [showDual] = useMediaQuery("(min-width: 825px)");

    useEffect(() => {
        const d = new Date();

        if (showDual) {
            setDrawnDays(getDrawnDays(selectedDate, false));
            setDrawnDays2(getDrawnDays(addMonths(selectedDate, 1), false));
        } else {
            setSingleDrawnDays(getDrawnDays(selectedDate, true));
        }
    }, [selectedDate, showDual]);

    const canGoLeft = isAfter(selectedDate, startDate);
    const canGoRight = isBefore(addMonths(selectedDate, 1), endDate);

    const goLeft = () => {
        // Disable go-left if the next month will be in the past
        if (!canGoLeft) return;

        setSelectedDate((prev) => subMonths(prev, 1));

        // TODO: to keep the behaviour of the two calendars consistent, we don't skip months that are not in allowedDates.
        // skip months that are not in allowedDates.
        // check if `allowedDates` has any dates that are in the previous month
        // if (allowedDates) {
        //     let hasOneDateInPreviousMonth = false;
        //     const prevMonthNum = selectedDateRef.current.getMonth();
        //     for (let allowedDate of allowedDates) {
        //         const allowedDateObj = dateParser(allowedDate);
        //         if (allowedDateObj.getMonth() == prevMonthNum) {
        //             hasOneDateInPreviousMonth = true;
        //             break;
        //         }
        //     }
        //     if (hasOneDateInPreviousMonth) {
        //     } else {
        //         goLeft();
        //     }
        // }
    };

    const goRight = async () => {
        // disable go-right if the next month is 1 year from now
        if (!canGoRight) return;
        setSelectedDate((prev) => addMonths(prev, 1));

        // TODO: to keep the behaviour of the two calendars consistent, we don't skip months that are not in allowedDates.
        // if (allowedDates) {
        //     let hasOneDateInNextMonth = false;
        //     // Use the ref object so that we get access to the already updated value
        //     const prevMonthNum = selectedDateRef.current.getMonth();
        //     for (let allowedDate of allowedDates) {
        //         const allowedDateObj = dateParser(allowedDate);
        //         if (allowedDateObj.getMonth() == prevMonthNum) {
        //             console.log("has one");
        //             hasOneDateInNextMonth = true;
        //             break;
        //         }
        //     }
        //     if (hasOneDateInNextMonth) {
        //     } else {
        //         goRight();
        //     }
        // }
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
        <Stack data-testid="calendar-component" w="100%">
            {showDual ? (
                <DualCalendar
                    {...{
                        _onStop,
                        allowedDates,
                        canGoLeft,
                        canGoRight,
                        datesSelected,

                        endDate,
                        goLeft,
                        goRight,
                        onMove,
                        onStart,
                        onTouchEnd,
                        selectedDate,
                        drawnDays,
                        drawnDays2,
                        startDate,
                        tempBefStart,
                    }}
                />
            ) : (
                <SingleCalendar
                    {...{
                        _onStop,
                        allowedDates,
                        canGoLeft,
                        canGoRight,
                        datesSelected,

                        endDate,
                        goLeft,
                        goRight,
                        onMove,
                        onStart,
                        onTouchEnd,
                        selectedDate,
                        singleDrawnDays,
                        startDate,
                        tempBefStart,
                    }}
                />
            )}
        </Stack>
    );
};

export default React.memo(CalendarContainer);

const DualCalendar = React.memo(
    ({
        selectedDate,
        canGoLeft,
        canGoRight,
        goLeft,
        goRight,

        drawnDays,
        drawnDays2,
        _onStop,
        allowedDates,
        datesSelected,
        endDate,
        onMove,
        onStart,
        onTouchEnd,
        startDate,
        tempBefStart,
    }: {
        selectedDate: Date;
        canGoLeft: boolean;
        goLeft: () => void;
        canGoRight: boolean;
        goRight: () => void;
        onStart: (e: SelectionEvent) => void;
        onMove: (e: SelectionEvent) => void;
        _onStop: (e: SelectionEvent) => void;
        tempBefStart: (e: SelectionEvent) => void;
        onTouchEnd: (
            e: React.TouchEvent<HTMLDivElement>,
            dateStr: string
        ) => void;
        datesSelected: string[];
        startDate: Date;
        endDate: Date;
        allowedDates: string[] | undefined;

        drawnDays: CalendarDayProps[];
        drawnDays2: CalendarDayProps[];
    }) => (
        <SimpleGrid columns={{ base: 1, sm: 2 }}>
            <Box>
                <Center>
                    <GoLeftButton canGoLeft={canGoLeft} goLeft={goLeft} />

                    <Text
                        data-testid="month-display"
                        mx={4}
                        width="80px"
                        textAlign={"center"}
                        fontWeight="bold"
                    >
                        {" "}
                        {format(selectedDate, "MMM yyyy")}
                    </Text>
                </Center>
                <Box px={8} pt={4}>
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
                                drawOverflow={false}
                            />
                        </Grid>
                    </SelectionArea>
                </Box>
            </Box>
            <Box>
                <Center>
                    <Text
                        data-testid="month-display"
                        mx={4}
                        width="80px"
                        textAlign={"center"}
                        fontWeight="bold"
                    >
                        {" "}
                        {format(addMonths(selectedDate, 1), "MMM yyyy")}
                    </Text>
                    <GoRightButton canGoRight={canGoRight} goRight={goRight} />
                </Center>

                <Box px={8} pt={4}>
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
                                drawnDays={drawnDays2}
                                onTouchEnd={onTouchEnd}
                                datesSelected={datesSelected}
                                startDate={startDate}
                                endDate={endDate}
                                selectedDate={addMonths(selectedDate, 1)}
                                allowedDates={allowedDates}
                                drawOverflow={false}
                            />
                        </Grid>
                    </SelectionArea>{" "}
                </Box>
            </Box>
        </SimpleGrid>
    )
);

const SingleCalendar = React.memo(
    ({
        selectedDate,
        canGoLeft,
        canGoRight,
        goLeft,
        goRight,

        singleDrawnDays,
        _onStop,
        allowedDates,
        datesSelected,
        endDate,
        onMove,
        onStart,
        onTouchEnd,
        startDate,
        tempBefStart,
    }: {
        selectedDate: Date;
        canGoLeft: boolean;
        goLeft: () => void;
        canGoRight: boolean;
        goRight: () => void;
        onStart: (e: SelectionEvent) => void;
        onMove: (e: SelectionEvent) => void;
        _onStop: (e: SelectionEvent) => void;
        tempBefStart: (e: SelectionEvent) => void;
        onTouchEnd: (
            e: React.TouchEvent<HTMLDivElement>,
            dateStr: string
        ) => void;
        datesSelected: string[];
        startDate: Date;
        endDate: Date;
        allowedDates: string[] | undefined;

        singleDrawnDays: CalendarDayProps[];
    }) => (
        <Stack
            px={{
                base: 0,
                sm: 8,
            }}
        >
            <Flex justifyContent={"center"}>
                <GoLeftButton canGoLeft={canGoLeft} goLeft={goLeft} />
                <Text
                    data-testid="month-display"
                    mx={4}
                    width="80px"
                    textAlign={"center"}
                >
                    {" "}
                    {format(selectedDate, "MMM yyyy")}
                </Text>
                <GoRightButton canGoRight={canGoRight} goRight={goRight} />
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
                        drawnDays={singleDrawnDays}
                        onTouchEnd={onTouchEnd}
                        datesSelected={datesSelected}
                        startDate={startDate}
                        endDate={endDate}
                        selectedDate={selectedDate}
                        allowedDates={allowedDates}
                        drawOverflow={true}
                    />
                </Grid>
            </SelectionArea>
        </Stack>
    )
);
