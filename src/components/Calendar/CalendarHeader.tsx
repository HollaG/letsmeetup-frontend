/**
 * The header for the calendar.
 * Displays the days of the weeks.
 */
import { GridItem, Text, TextProps } from "@chakra-ui/react";
import { CalendarGridItemProps } from "./CalendarContainer";

const HEADER_STYLES: TextProps = {
    textAlign: "center",
    fontWeight: "bold",
};

const CalendarHeader = () => {
    return (
        <>
            <GridItem {...CalendarGridItemProps}>
                <Text {...HEADER_STYLES}>Sun</Text>
            </GridItem>
            <GridItem {...CalendarGridItemProps}>
                <Text {...HEADER_STYLES}>Mon</Text>
            </GridItem>
            <GridItem {...CalendarGridItemProps}>
                <Text {...HEADER_STYLES}>Tue</Text>
            </GridItem>
            <GridItem {...CalendarGridItemProps}>
                <Text {...HEADER_STYLES}>Wed</Text>
            </GridItem>
            <GridItem {...CalendarGridItemProps}>
                <Text {...HEADER_STYLES}>Thu</Text>
            </GridItem>
            <GridItem {...CalendarGridItemProps}>
                <Text {...HEADER_STYLES}>Fri</Text>
            </GridItem>
            <GridItem {...CalendarGridItemProps}>
                <Text {...HEADER_STYLES}>Sat</Text>
            </GridItem>
        </>
    );
};

export default CalendarHeader;
