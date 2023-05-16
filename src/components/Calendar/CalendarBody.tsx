import {
    Center,
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
import React, { useCallback } from "react";
import { useMemo } from "react";
import { CalendarDayProps, dateEncoder } from "./CalendarContainer";
import CalendarDay from "./CalendarDay";

/**
 * The body of the calendar.
 * Contains the dates and selected states... etc
 */

export const BODY_STYLES: TextProps = {
    textAlign: "center",
    fontWeight: "medium",
    fontSize: "sm",
};
export type CalendarBodyProps = {
    drawnDays: CalendarDayProps[];
    // datesSelected: Date[];
    datesSelected: string[];
    onTouchEnd: (e: React.TouchEvent<HTMLDivElement>, dateStr: string) => void
};

// Color values
const DARK__UNSELECTABLE_TEXT_COLOR = "gray.600";
const LIGHT__UNSELECTABLE_TEXT_COLOR = "gray.400";
const DARK__SELECTED_DATE_COLOR = "blue.800";
const LIGHT__SELECTED_DATE_COLOR = "blue.200";

const CalendarBody = ({ drawnDays, datesSelected, onTouchEnd }: CalendarBodyProps) => {
    // console.log("body reremndered")

    // If the date is one that is in-between other dates, draw a Square instead of a Circle, and set minWidth to be 100%.
    return (
        <>
            {drawnDays.map((d, i) => (
                <GridItem py={2} key={dateEncoder(d.date)}>
                    <CalendarDay
                        key={dateEncoder(d.date)}
                        children={d.text}
                        dataKey={dateEncoder(d.date)}
                        selected={datesSelected.includes(dateEncoder(d.date))}
                        prevSelected={datesSelected.includes(
                            dateEncoder(subDays(d.date, 1))
                        )}
                        nextSelected={datesSelected.includes(
                            dateEncoder(addDays(d.date, 1))
                        )}
                        onTouchEnd={onTouchEnd}
                    />
                    {/* <CalendarDay key={dateEncoder(d.date)} children={d.text} dataKey={dateEncoder(d.date)} selected={false}/> */}
                </GridItem>
            ))}
            ;
        </>
    );
};

export default React.memo(CalendarBody);
