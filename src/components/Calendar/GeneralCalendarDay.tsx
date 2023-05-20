import {
    Box,
    ChakraProps,
    Circle,
    Square,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { addDays, isAfter, isBefore, subDays } from "date-fns";
import { isSameDay } from "date-fns/esm";
import React, { CSSProperties } from "react";
import { BODY_STYLES } from "./CalendarBody";
import { dateEncoder, dateParser } from "./CalendarContainer";

// Color values
const DARK__UNSELECTABLE_TEXT_COLOR = "gray.600";
const DARK__UNSELECTABLE_CURRENT_DAY_TEXT_COLOR = "gray.500";
const LIGHT__UNSELECTABLE_TEXT_COLOR = "gray.400";
const DARK__SELECTED_DATE_COLOR = "blue.800";
const LIGHT__SELECTED_DATE_COLOR = "blue.200";
/**
 * The props for the CalendarDay component.
 * @param children the text to display in the day
 * @param dataKey the data-key to use for the day
 * @param datesSelected the dates that are selected
 */
export type GeneralCalendarDayProps = {
    children: React.ReactNode;

    date: Date;

    getColor: (date: Date) => string; // what colour should the background of a date be?
    getTextColor: (date: Date) => string; // what colour should the text of a date be?

    onClick: (date: Date) => void; // what happens when a date is clicked?

    getProperties?: (date: Date) => ChakraProps;
};

export type DrawnDayProps = {
    children: React.ReactNode;
    date: Date;
};

/**
 *
 * @param param0 the object containing the children, dataKey, and datesSelected
 * @returns A Day component for use in the Calendar
 */
const GeneralCalendarDay = ({
    children,
    getColor,
    getTextColor,
    onClick,
    getProperties,
    date,
}: GeneralCalendarDayProps) => {
    // console.log("day rerender")
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
    const CURRENT_DATE_COLOR = useColorModeValue("gray.200", "gray.600");

    /**
     * Calculates the color of the circle around the date, depending on whether
     * it's selected, today, or not selected.
     *
     * @returns the color of the circle around the date
     */
    // const getBgColor = () => {
    // if (selected) {
    //     return SELECTED_DATE_COLOR;
    // } else if (isSameDay(dateParser(dataKey), new Date())) {
    //     return CURRENT_DATE_COLOR;
    // } else {
    //     return "unset";
    // }
    // return "unset";
    // };

    /**
     * Formats the class name of the element, based on whether it's selected, selectable, or not.
     *
     * @returns the class name for the day
     */
    // const getClassName = () => {
    // let className = "date ";
    // if (selected) {
    //     className += "selected ";
    // }
    // if (isSelectable) {
    //     className += "selectable ";
    // }
    // return className;
    // return "";
    // };

    /**
     * Gets the text color this day should be. Dark for unselectable (before today), normal for selectable.
     * @returns the color the text should be
     */
    // const getTextColor = () => {
    // if (!isSelectable) {
    //     if (isSameDay(dateParser(dataKey), new Date())) {
    //         return UNSELECTABLE_CURRENT_DAY_TEXT_COLOR;
    //     } else {
    //         return UNSELECTABLE_TEXT_COLOR;
    //     }
    // } else {
    //     return "unset";
    // }
    // return "unset";
    // };

    /**
     *
     * @returns the border radius of the day depending on the selected state
     */
    // const getRadius = () => {
    // if (!selected) {
    //     return "99999px";
    // }
    // if (prevSelected && nextSelected) {
    //     return "0";
    // }
    // if (!prevSelected && nextSelected) {
    //     return "99999px 0 0 99999px";
    // }
    // if (prevSelected && !nextSelected) {
    //     return "0 99999px 99999px 0";
    // }
    // if (!prevSelected && !nextSelected) {
    //     return "99999px";
    // }
    // return "unset";
    // };

    // const getWidth = () => {
    // if (selected && (nextSelected || prevSelected)) {
    //     return "100%";
    // } else {
    //     return "unset";
    // }
    // return "unset";
    // };

    return (
        <Box
            {...(getProperties ? getProperties(date) : {})}
            width="100%"
            onClick={() => onClick(date)}
        >
            <Square
                bg={getColor(date)}
                size="36px"
                mx="auto"
                borderRadius={"99999px"}
                // minW={getWidth()}
            >
                <Text {...BODY_STYLES} color={getTextColor(date)}>
                    {children}{" "}
                </Text>
            </Square>
        </Box>
    );
};

export default React.memo(GeneralCalendarDay);
