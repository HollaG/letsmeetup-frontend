import { ChakraProps, useColorModeValue } from "@chakra-ui/react";
import { isAfter, isBefore, parse } from "date-fns";
import { Meetup } from "../../firebase/db/repositories/meetups";
import {
    RANGE_EMPTY_LIGHT,
    RANGE_EMPTY_DARK,
    RANGE_0_LIGHT,
    RANGE_0_DARK,
    RANGE_1_LIGHT,
    RANGE_1_DARK,
    RANGE_2_LIGHT,
    RANGE_2_DARK,
    RANGE_3_LIGHT,
    RANGE_3_DARK,
    RANGE_4_LIGHT,
    RANGE_4_DARK,
    RANGE_FULL_LIGHT,
    RANGE_FULL_DARK,
} from "../../lib/std";
import { removeTime } from "../../routes/meetup";
import {
    aC,
    RangeColors,
} from "../../utils/availabilityList.utils";
import { dateEncoder, dateParser } from "../Calendar/CalendarContainer";
import GeneralCalendar from "../Calendar/GeneralCalendar";
// Color values
const DARK__UNSELECTABLE_TEXT_COLOR = "gray.600";
const DARK__UNSELECTABLE_CURRENT_DAY_TEXT_COLOR = "gray.500";
const LIGHT__UNSELECTABLE_TEXT_COLOR = "gray.400";
const DARK__SELECTED_DATE_COLOR = "blue.800";
const LIGHT__SELECTED_DATE_COLOR = "blue.200";
/**
 *
 *
 * @param param0
 * @returns
 */
const CalendarDisplay = ({ meetup }: { meetup: Meetup }) => {
    const UNSELECTABLE_TEXT_COLOR = useColorModeValue(
        LIGHT__UNSELECTABLE_TEXT_COLOR,
        DARK__UNSELECTABLE_TEXT_COLOR
    );
    const UNSELECTABLE_CURRENT_DAY_TEXT_COLOR = useColorModeValue(
        LIGHT__UNSELECTABLE_TEXT_COLOR,
        DARK__UNSELECTABLE_CURRENT_DAY_TEXT_COLOR
    );
    const SELECTED_DATE_COLOR = useColorModeValue(
        LIGHT__SELECTED_DATE_COLOR,
        DARK__SELECTED_DATE_COLOR
    );

    const range_empty = useColorModeValue(RANGE_EMPTY_LIGHT, RANGE_EMPTY_DARK);
    const range_0 = useColorModeValue(RANGE_0_LIGHT, RANGE_0_DARK);
    const range_1 = useColorModeValue(RANGE_1_LIGHT, RANGE_1_DARK);
    const range_2 = useColorModeValue(RANGE_2_LIGHT, RANGE_2_DARK);
    const range_3 = useColorModeValue(RANGE_3_LIGHT, RANGE_3_DARK);
    const range_4 = useColorModeValue(RANGE_4_LIGHT, RANGE_4_DARK);
    const range_full = useColorModeValue(RANGE_FULL_LIGHT, RANGE_FULL_DARK);

    const colors: RangeColors = [
        range_empty,
        range_0,
        range_1,
        range_2,
        range_3,
        range_4,
        range_full,
    ];

    const fullColor = "#38A169";
    const emptyColor = range_empty;

    const currentMonthNum = new Date().getMonth();

    const initialDate = parse(
        `${1}-${currentMonthNum + 1}-${new Date().getFullYear()}`,
        "d-MM-yyyy",
        new Date()
    );

    // get the start and end dates
    const startDateStr = meetup.dates.sort()[0];
    const endDateStr = meetup.dates.sort()[meetup.dates.length - 1];

    const startDate = dateParser(startDateStr);
    const endDate = dateParser(endDateStr);

    /**
     * Format the selection map for non-full-day meetups
     *
     * Note: because removeTime doesn't do anything if the string is of the wrong format,
     * we can use this for both full-day and non-full-day meetups
     */
    const availabilityPerDayMap: { [dateStr: string]: number } = {};
    for (const dateTimeStr in meetup.selectionMap) {
        const dateStr = removeTime(dateTimeStr);
        if (availabilityPerDayMap[dateStr]) {
            availabilityPerDayMap[dateStr] = Math.max(
                availabilityPerDayMap[dateStr],
                meetup.selectionMap[dateTimeStr].length
            );
        } else {
            availabilityPerDayMap[dateStr] =
                meetup.selectionMap[dateTimeStr].length;
        }
    }

    /**
     * Color the background of the calendar based on how many people can make it for that slot
     *
     * @param date The date of the drawn day
     * @returns The color of the background
     */
    const getColor = (date: Date) => {
        const dateStr = dateEncoder(date);
        const numTotal = meetup.users.length;
        const numThisDate = availabilityPerDayMap[dateStr];

        if (!meetup.dates.includes(dateStr)) return "unset";

        if (numThisDate === 0 || !numThisDate) return "unset";
        const col = aC(numTotal, numThisDate, fullColor, emptyColor);

        return col;
    };

    const getTextColor = (date: Date) => {
        if (
            isAfter(date, dateParser(endDateStr)) ||
            isBefore(date, dateParser(startDateStr)) ||
            !meetup.dates.includes(dateEncoder(date))
        ) {
            return UNSELECTABLE_TEXT_COLOR;
        } else {
            return "unset";
        }
    };

    const onClick = (date: Date) => {
        const dateStr = dateEncoder(date);

        document.getElementById(dateStr)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const getProperties = (date: Date) => {
        let cursor = "";
        if (
            isBefore(date, startDate) ||
            isAfter(date, endDate) ||
            !meetup.dates.includes(dateEncoder(date))
        ) {
            cursor = "not-allowed";
        } else {
            cursor = "pointer";
        }
        return {
            cursor,
        } as ChakraProps;
    };

    return (
        <GeneralCalendar
            endDate={endDate}
            startDate={startDate}
            getColor={getColor}
            getTextColor={getTextColor}
            onClick={onClick}
            getProperties={getProperties}
        />
    );
};

export default CalendarDisplay;
