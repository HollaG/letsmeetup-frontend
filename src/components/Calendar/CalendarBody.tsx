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
import { format, isBefore, isSameDay, isToday } from "date-fns";
import { subDays } from "date-fns/esm";
import React from "react";
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
    onDateClick: (date: Date) => void;
    // datesSelected: Date[];
    datesSelected: string[]
};

// Color values
const DARK__UNSELECTABLE_TEXT_COLOR = "gray.600";
const LIGHT__UNSELECTABLE_TEXT_COLOR = "gray.400";
const DARK__SELECTED_DATE_COLOR = "blue.800";
const LIGHT__SELECTED_DATE_COLOR = "blue.200";

const getComponentToDraw = (entry: CalendarDayProps, datesSelected: string[]) => {
    // order of drawing:
    // check if this date is selected
    // --> then check if this date is inbetween two selected dates (left and right)
    //         --> yes: draw square
    //         --> no: draw circle
    //
    // else if this date is in the past, draw InvalidDate
    // else if this date is now, draw CurrentDate
    // else draw UnselectedDate

    // if (datesSelected.find((d) => isSameDay(entry.date, d))) {
    //     // TODO
    //     // if date is selected
    //     return <SelectedDate children={entry.text} dataKey={format(entry.date, "yyyy-MM-dd")}/>;
    //     // if (false) {
    //     // } else {
    //     // }
    // } else if (isBefore(entry.date, subDays(new Date(), 1))) {
    //     // if date is in the past
    //     return <InvalidDate children={entry.text}  dataKey={format(entry.date, "yyyy-MM-dd")}/>;
    // } else if (isToday(entry.date)) {
    //     return <CurrentDate children={entry.text}  dataKey={format(entry.date, "yyyy-MM-dd")}/>;
    // } else {
    //     return <UnselectedDate children={entry.text}  dataKey={format(entry.date, "yyyy-MM-dd")}/>;
    // }

    // if (datesSelected.includes(dateEncoder(entry.date))) {
    //     // TODO
    //     // if date is selected
    //     return <SelectedDate children={entry.text} dataKey={dateEncoder(entry.date)}/>;
    //     // if (false) {
    //     // } else {
    //     // }
    // } else if (isBefore(entry.date, subDays(new Date(), 1))) {
    //     // if date is in the past
    //     return <InvalidDate children={entry.text}  dataKey={dateEncoder(entry.date)}/>;
    // } else if (isToday(entry.date)) {
    //     return <CurrentDate children={entry.text}  dataKey={dateEncoder(entry.date)}/>;
    // } else {
    //     return <UnselectedDate children={entry.text}  dataKey={dateEncoder(entry.date)}/>;
    // }

    return <CalendarDay children={entry.text} dataKey={dateEncoder(entry.date)} datesSelected={datesSelected}/>
};

const CalendarBody = ({
    drawnDays,
    onDateClick,
    datesSelected,
}: CalendarBodyProps) => {
    // console.log("body reremndered")
    const UNSELECTABLE_TEXT_COLOR = useColorModeValue(
        LIGHT__UNSELECTABLE_TEXT_COLOR,
        DARK__UNSELECTABLE_TEXT_COLOR
    );
    const SELECTED_DATE_COLOR = useColorModeValue(
        LIGHT__SELECTED_DATE_COLOR,
        DARK__SELECTED_DATE_COLOR
    );
    // If the date is one that is in-between other dates, draw a Square instead of a Circle, and set minWidth to be 100%.
    return (
        <>
            {drawnDays.map((d, i) => (
                <GridItem py={2} key={dateEncoder(d.date)} onClick={() => onDateClick(d.date)}>
                    {getComponentToDraw(d, datesSelected)}
                </GridItem>
            ))}
            ;
        </>
    );
};

type InnerTextProps = {
    children: string;
    dataKey: string;
};

const SelectedDate = ({ children, dataKey }: InnerTextProps) => {
    const SELECTED_DATE_COLOR = useColorModeValue(
        LIGHT__SELECTED_DATE_COLOR,
        DARK__SELECTED_DATE_COLOR
    );

    return (
        <Circle
            bg={SELECTED_DATE_COLOR}
            size="36px"
            mx="auto"
            className="selectable selected"
            data-key={dataKey}
        >
            <Text {...BODY_STYLES}>{children} </Text>
        </Circle>
    );
};

const UnselectedDate = ({ children, dataKey }: InnerTextProps) => {
    return (
        <Circle bg={"unset"} size="36px" mx="auto" className="selectable" data-key={dataKey}>
            <Text {...BODY_STYLES}>{children} </Text>
        </Circle>
    );
};

const InvalidDate = ({ children }: InnerTextProps) => {
    const UNSELECTABLE_TEXT_COLOR = useColorModeValue(
        LIGHT__UNSELECTABLE_TEXT_COLOR,
        DARK__UNSELECTABLE_TEXT_COLOR
    );

    // Override onClick to stop the event bubbling up and triggering useless checks
    return (
        <Circle
            bg={"unset"}
            size="36px"
            mx="auto"
            onClick={(e) => e.stopPropagation()}

        >
            <Text color={UNSELECTABLE_TEXT_COLOR} {...BODY_STYLES}>
                {children}{" "}
            </Text>
        </Circle>
    );
};

const CurrentDate = ({ children, dataKey }: InnerTextProps) => {
    const CURRENT_DATE_COLOR = useColorModeValue("gray.200", "gray.600");
    return (
        <Circle
            bg={CURRENT_DATE_COLOR}
            size="36px"
            mx="auto"
            className="selectable"
            data-key={dataKey}
        >
            <Text {...BODY_STYLES}>{children} </Text>
        </Circle>
    );
};

export default React.memo(CalendarBody);
