import { Box, Circle, Square, Text, useColorModeValue } from "@chakra-ui/react";
import { addDays, isAfter, isBefore, subDays } from "date-fns";
import { isSameDay } from "date-fns/esm";
import React from "react";
import { BODY_STYLES } from "./CalendarBody";
import { dateEncoder, dateParser } from "./CalendarContainer";

// Color values
const DARK__UNSELECTABLE_TEXT_COLOR = "gray.600";
const LIGHT__UNSELECTABLE_TEXT_COLOR = "gray.400";
const DARK__SELECTED_DATE_COLOR = "blue.800";
const LIGHT__SELECTED_DATE_COLOR = "blue.200";
/**
 * The props for the CalendarDay component.
 * @param children the text to display in the day
 * @param dataKey the data-key to use for the day
 * @param datesSelected the dates that are selected
 */
type CalendarDayProps = {
    children: string;
    dataKey: string;
    // datesSelected: string[];
    selected: boolean;
    prevSelected: boolean;
    nextSelected: boolean;
    onTouchEnd: (e: React.TouchEvent<HTMLDivElement>, dateStr: string) => void
    // type: 0|1|2|3|4 // 0: unselected, 1: circle, 2: square, 3: left square, 4: right square
};

/**
 *
 * @param param0 the object containing the children, dataKey, and datesSelected
 * @returns A Day component for use in the Calendar
 */
const CalendarDay = ({
    children,
    dataKey,
    // datesSelected,
    selected,
    nextSelected,
    prevSelected,
    onTouchEnd
}: CalendarDayProps) => {
    // console.log("day rerender")
    const UNSELECTABLE_TEXT_COLOR = useColorModeValue(
        LIGHT__UNSELECTABLE_TEXT_COLOR,
        DARK__UNSELECTABLE_TEXT_COLOR
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
    const getBgColor = () => {
        if (selected) {
            return SELECTED_DATE_COLOR;
        } else if (isSameDay(dateParser(dataKey), new Date())) {
            return CURRENT_DATE_COLOR;
        } else {
            return "unset";
        }
    };

    /**
     * Formats the class name of the element, based on whether it's selected, selectable, or not.
     *
     * @returns the class name for the day
     */
    const getClassName = () => {
        let className = "";
        if (selected) {
            className += "selected ";
        }
        if (isAfter(dateParser(dataKey), subDays(new Date(), 1))) {
            className += "selectable ";
        }
        return className;
    };

    /**
     * Gets the text color this day should be. Dark for unselectable (before today), normal for selectable.
     * @returns the color the text should be
     */
    const getTextColor = () => {
        if (isBefore(dateParser(dataKey), subDays(new Date(), 1))) {
            return UNSELECTABLE_TEXT_COLOR;
        } else {
            return "unset";
        }
    };

    /**
     * 
     * @returns the border radius of the day depending on the selected state
     */
    const getRadius = () => {
        if (!selected) {
            return "99999px"
        }
        if (prevSelected && nextSelected) {
            return "0"
        }
        if (!prevSelected && nextSelected) {
            return "99999px 0 0 99999px";
        }
        if (prevSelected && !nextSelected) {
            return "0 99999px 99999px 0";
        }
        if (!prevSelected && !nextSelected) {
            return "99999px"
        }
    }

    const getWidth = () => {
        if (selected && (nextSelected || prevSelected)) {
            return "100%"
        } else {
            return "unset"
        }
    }

    const prevDateStr = dateEncoder(subDays(dateParser(dataKey), 1));
    const nextDateStr = dateEncoder(addDays(dateParser(dataKey), 1));

    return (
        <Box data-key={dataKey} className={getClassName()} width="100%">
            <Square bg={getBgColor()} size="36px" mx="auto" borderRadius={getRadius()} minW={getWidth()}  onTouchEnd={(e) => onTouchEnd(e, dataKey)}>
                <Text {...BODY_STYLES} color={getTextColor()}>
                    {children}{" "}
                </Text>
            </Square>
            {/* {selected &&
            (true ||
            true) ? (
                <Square
                    bg={SELECTED_DATE_COLOR}
                    size="36px"
                    mx="auto"
                    minWidth="100%"
                    borderRadius={true && true ? "0" : (!true ? "99999px 0 0 99999px" : "0 99999px 99999px 0")}
                >
                    <Text {...BODY_STYLES} color={getTextColor()}>
                        {children}{" "}
                    </Text>
                </Square>
            ) : (
                <Circle
                    bg={getCircleColor()}
                    size="36px"
                    mx="auto"
                >
                    <Text {...BODY_STYLES} color={getTextColor()}>
                        {children}{" "}
                    </Text>
                </Circle>
            )} */}
        </Box>
    );
};

export default React.memo(CalendarDay);
