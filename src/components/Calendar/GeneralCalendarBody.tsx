import {
    Center,
    ChakraProps,
    Circle,
    color,
    GridItem,
    Square,
    Text,
    TextProps,
    useColorModeValue,
} from "@chakra-ui/react";
import { addDays, format, isBefore, isSameDay, isToday } from "date-fns";
import { subDays } from "date-fns/esm";
import React, { CSSProperties, useCallback } from "react";
import { useMemo } from "react";
import { CalendarDayProps, dateEncoder } from "./CalendarContainer";
import CalendarDay from "./CalendarDay";
import GeneralCalendarDay, {
    DrawnDayProps,
    GeneralCalendarDayProps,
} from "./GeneralCalendarDay";

/**
 * The body of the calendar.
 * Contains the dates and selected states... etc
 */

export const BODY_STYLES: TextProps = {
    textAlign: "center",
    fontWeight: "medium",
    fontSize: "sm",
};
export type GeneralCalendarBodyProps = {
    drawnDays: DrawnDayProps[];

    getColor: (date: Date) => string; // what colour should the background of a date be?
    getTextColor: (date: Date) => string; // what colour should the text of a date be?

    onClick: (date: Date) => void; // what happens when a date is clicked?

    getProperties?: (date: Date) => ChakraProps;
};

// Color values
const DARK__UNSELECTABLE_TEXT_COLOR = "gray.600";
const LIGHT__UNSELECTABLE_TEXT_COLOR = "gray.400";
const DARK__SELECTED_DATE_COLOR = "blue.800";
const LIGHT__SELECTED_DATE_COLOR = "blue.200";

const GeneralCalendarBody = ({
    drawnDays,
    getColor,
    getProperties,
    getTextColor,
    onClick,
}: GeneralCalendarBodyProps) => {
    // If the date is one that is in-between other dates, draw a Square instead of a Circle, and set minWidth to be 100%.
    return (
        <>
            {drawnDays.map((d, i) => (
                <GridItem
                    py={2}
                    key={dateEncoder(d.date)}
                    data-testid={
                        i == drawnDays.length - 1 ? "last-day" : `${i + 1}-day`
                    }
                >
                    <GeneralCalendarDay
                        key={dateEncoder(d.date)}
                        children={d.children}
                        date={d.date}
                        onClick={onClick}
                        getColor={getColor}
                        getProperties={getProperties}
                        getTextColor={getTextColor}
                    />
                </GridItem>
            ))}
        </>
    );
};

export default React.memo(GeneralCalendarBody, (prevProps, nextProps) => {
    // only update the body if the dates selected or the drawn days have changed
    const res =
        prevProps.drawnDays.length === nextProps.drawnDays.length &&
        prevProps.drawnDays[0].date.toString() ===
            nextProps.drawnDays[0].date.toString();

    return res;
});
