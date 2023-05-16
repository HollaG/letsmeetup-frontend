import { Box, Circle, Square, Text, useColorModeValue } from "@chakra-ui/react";
import { addDays, isAfter, isBefore, subDays } from "date-fns";
import { isSameDay } from "date-fns/esm";
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
    datesSelected: string[];
};

/**
 *
 * @param param0 the object containing the children, dataKey, and datesSelected
 * @returns A Day component for use in the Calendar
 */
const CalendarDay = ({
    children,
    dataKey,
    datesSelected,
}: CalendarDayProps) => {
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
    const getCircleColor = () => {
        if (datesSelected.includes(dataKey)) {
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
        if (datesSelected.includes(dataKey)) {
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

    const prevDateStr = dateEncoder(subDays(dateParser(dataKey), 1));
    const nextDateStr = dateEncoder(addDays(dateParser(dataKey), 1));

    /**
     * Gets the appropiate border radius to set so that the calendar looks seamless when selecting multiple 
     * dates.
     * 
     * @returns the border radius to set
     */
    const getBorderRadius = () => {

    }
    // return (
    //     <Circle
    //         bg={getCircleColor()}
    //         size="36px"
    //         mx="auto"
    //         className={getClassName()}
    //         data-key={dataKey} 
    //     >
    //         <Text {...BODY_STYLES} color={getTextColor()}>
    //             {children}{" "}
    //         </Text>
    //     </Circle>
    // );
    return (
        <Box data-key={dataKey} className={getClassName()} width="100%">
            {datesSelected.includes(dataKey) &&
            (datesSelected.includes(prevDateStr) ||
            datesSelected.includes(nextDateStr)) ? (
                <Square
                    bg={SELECTED_DATE_COLOR}
                    size="36px"
                    mx="auto"
                    minWidth="100%"
                    borderRadius={datesSelected.includes(prevDateStr) && datesSelected.includes(nextDateStr) ? "0" : (!datesSelected.includes(prevDateStr) ? "99999px 0 0 99999px" : "0 99999px 99999px 0")}
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
            )}
        </Box>
    );
};

export default CalendarDay;
