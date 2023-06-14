import {
    Box,
    ChakraProps,
    Circle,
    Square,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { BODY_STYLES } from "./CalendarBody";

// Color values
const DARK__UNSELECTABLE_TEXT_COLOR = "gray.600";
const DARK__UNSELECTABLE_CURRENT_DAY_TEXT_COLOR = "gray.500";
const LIGHT__UNSELECTABLE_TEXT_COLOR = "gray.400";
const DARK__SELECTED_DATE_COLOR = "blue.800";
const LIGHT__SELECTED_DATE_COLOR = "blue.200";
/**
 * The props for the CalendarDay component.
 * @param children the text to display in the day
 * @param date the date that the day represents
 * @param getColor a function that returns the background color of the day
 * @param getTextColor a function that returns the text color of the day
 * @param onClick a function that is called when the day is clicked
 * @param getProperties a function that returns additional CSS properties for the day
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

    // Given the percentage of people available on this day, generate the background
    // https://stackoverflow.com/questions/21205652/how-to-draw-a-circle-sector-in-css

    // return children ? (
    //     <Box
    //         {...(getProperties ? getProperties(date) : {})}
    //         width="100%"
    //         onClick={() => onClick(date)}
    //     >
    //         <Square
    //             bg={getColor(date)}
    //             size="36px"
    //             mx="auto"
    //             borderRadius={"99999px"}
    //             // minW={getWidth()}
    //         >
    //             <Text {...BODY_STYLES} color={getTextColor(date)}>
    //                 {children}{" "}
    //             </Text>
    //         </Square>
    //     </Box>
    // ) : (
    //     <Box width="100%">
    //         <Square
    //             size="36px"
    //             mx="auto"
    //             borderRadius={"99999px"}
    //             // minW={getWidth()}
    //         ></Square>
    //     </Box>
    // );
    <Square />;

    return children ? (
        <Box width="100%" onClick={() => onClick(date)}>
            <Circle
                bg={getColor(date)}
                size="36px"
                mx="auto"
                {...(getProperties ? getProperties(date) : {})}
                // borderRadius={"99999px"}
                // minW={getWidth()}
            >
                <Text {...BODY_STYLES} color={getTextColor(date)}>
                    {children}{" "}
                </Text>
            </Circle>
        </Box>
    ) : (
        <Box width="100%">
            <Circle
                size="36px"
                mx="auto"
                // borderRadius={"99999px"}
                // minW={getWidth()}
            ></Circle>
        </Box>
    );
};

export default GeneralCalendarDay;
