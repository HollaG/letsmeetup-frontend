import {
    Stack,
    Flex,
    Button,
    Grid,
    Text,
    ChakraProps,
    SimpleGrid,
    Box,
    Center,
    IconButton,
} from "@chakra-ui/react";
import SelectionArea from "@viselect/react";
import {
    addDays,
    addMonths,
    format,
    isAfter,
    isBefore,
    parse,
    subDays,
    subMonths,
} from "date-fns";
import { CSSProperties, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CalendarBody from "./CalendarBody";
import CalendarHeader from "./CalendarHeader";
import GeneralCalendarBody from "./GeneralCalendarBody";
import { DrawnDayProps, GeneralCalendarDayProps } from "./GeneralCalendarDay";

type GeneralCalendarProps = {
    startDate: Date;
    endDate: Date;

    // canGoLeft?: (date: Date) => boolean; // whether we can go -1 month
    // canGoRight?: (date: Date) => boolean; // whether we can go +1 month

    getColor: (date: Date) => string; // what colour should the background of a date be?
    getTextColor: (date: Date) => string; // what colour should the text of a date be?

    onClick: (date: Date) => void; // what happens when a date is clicked?

    getProperties?: (date: Date) => ChakraProps;

    initialDate?: Date; // the initial date to display. Defaults to today
};

const GeneralCalendar = ({
    startDate,
    endDate,
    initialDate,
    // canGoLeft,
    // canGoRight,

    getColor,
    getTextColor,

    onClick,

    getProperties,
}: GeneralCalendarProps) => {
    const currentMonthNum = new Date().getMonth();
    const [drawnDays, setDrawnDays] = useState<DrawnDayProps[]>([]);
    const [drawnDays2, setDrawnDays2] = useState<DrawnDayProps[]>([]);

    const firstDateInMonth = parse(
        `${1}-${currentMonthNum + 1}-${new Date().getFullYear()}`,
        "d-MM-yyyy",
        new Date()
    );

    const [selectedDate, setSelectedDate] = useState<Date>(
        initialDate || firstDateInMonth
    );

    const _canGoLeft = isAfter(selectedDate, startDate);
    const _canGoRight = isBefore(addMonths(selectedDate, 1), endDate);

    const goLeft = () => {
        // Disable go-left if the next month will be in the past
        if (!_canGoLeft) return;
        setSelectedDate((prev) => subMonths(prev, 1));
    };

    const goRight = () => {
        // disable go-right if the next month is 1 year from now
        if (!_canGoRight) return;
        setSelectedDate((prev) => addMonths(prev, 1));
    };

    useEffect(() => {
        const d = new Date();

        const getDrawnDays = (
            selectedDate: Date,
            drawOverflow: boolean = true
        ) => {
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
            let tempArray: DrawnDayProps[] = [];

            let lookBackDays = firstDayInMonth; // The number of days to go 'backwards' because we need to fill up the calendar rows

            let lbd = firstDateInMonth;
            while (lookBackDays > 0) {
                lookBackDays = lookBackDays - 1;
                lbd = subDays(lbd, 1);

                tempArray.push({
                    date: lbd,
                    children: drawOverflow ? <>{format(lbd, "d")}</> : "",
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
                    children: <>{format(lfd, "d")}</>,
                });
                lfd = addDays(lfd, 1);
            }

            // add the 'overflow' days
            while (tempArray.length % 7 != 0) {
                tempArray.push({
                    date: lfd,
                    children: drawOverflow ? <>{format(lfd, "d")}</> : "",
                });
                lfd = addDays(lfd, 1);
            }

            return tempArray;
        };
        setDrawnDays(getDrawnDays(selectedDate, false));
        setDrawnDays2(getDrawnDays(addMonths(selectedDate, 1), false)); // todo: change 1 to the next month with data
    }, [selectedDate]);

    return (
        <Stack data-testid="calendar-component">
            {/* <Flex justifyContent={"center"}>
                <Button
                    size="xs"
                    isDisabled={!_canGoLeft}
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
                    isDisabled={!_canGoRight}
                    aria-label="Next month"
                >
                    {" "}
                    &gt;{" "}
                </Button>
            </Flex> */}

            <SimpleGrid columns={{ base: 1, md: 2 }}>
                <Box>
                    <Center>
                        <IconButton
                            size="xs"
                            isDisabled={!_canGoLeft}
                            onClick={goLeft}
                            aria-label="Previous month"
                            icon={<FaChevronLeft />}
                        />
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
                        <Grid
                            templateColumns="repeat(7, 1fr)"
                            gap={0}
                            // data-testid="select-container-calendar"
                        >
                            <CalendarHeader />
                            <GeneralCalendarBody
                                getColor={getColor}
                                getProperties={getProperties}
                                getTextColor={getTextColor}
                                onClick={onClick}
                                drawnDays={drawnDays}
                            />
                        </Grid>
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
                        <IconButton
                            size="xs"
                            isDisabled={!_canGoRight}
                            onClick={goRight}
                            aria-label="Next month"
                            icon={<FaChevronRight />}
                        />
                    </Center>

                    <Box px={8} pt={4}>
                        <Grid
                            templateColumns="repeat(7, 1fr)"
                            gap={0}
                            // data-testid="select-container-calendar"
                        >
                            <CalendarHeader />
                            <GeneralCalendarBody
                                getColor={getColor}
                                getProperties={getProperties}
                                getTextColor={getTextColor}
                                onClick={onClick}
                                drawnDays={drawnDays2}
                            />
                        </Grid>
                    </Box>
                </Box>
            </SimpleGrid>
        </Stack>
    );
};

export default GeneralCalendar;
