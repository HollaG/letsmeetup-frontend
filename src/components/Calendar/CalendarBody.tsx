import {
    GridItem,
    TextProps,
} from "@chakra-ui/react";
import { addDays } from "date-fns";
import { subDays } from "date-fns/esm";
import React from "react";
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
    onTouchEnd: (e: React.TouchEvent<HTMLDivElement>, dateStr: string) => void;
    startDate: Date; // the start date of the calendar. Defaults to today
    endDate: Date; // the end date of the calendar. Defaults to 1 year from today
    selectedDate: Date;
    allowedDates?: string[];
    drawOverflow: boolean; // whether to draw the previous / next month's date
};

const CalendarBody = ({
    drawnDays,
    datesSelected,
    onTouchEnd,
    startDate,
    endDate,
    selectedDate,
    allowedDates,
}: CalendarBodyProps) => {
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
                        startDate={startDate}
                        endDate={endDate}
                        // allowedDates={allowedDates}
                        isAllowed={
                            allowedDates
                                ? allowedDates.includes(dateEncoder(d.date))
                                : true
                        }
                    />
                </GridItem>
            ))}
        </>
    );
};

export default React.memo(CalendarBody, (prevProps, nextProps) => {
    // only update the body if the dates selected or the drawn days have changed

    const res =
        prevProps.datesSelected.length === nextProps.datesSelected.length &&
        prevProps.drawnDays.length === nextProps.drawnDays.length &&
        prevProps.selectedDate.toString() ===
            nextProps.selectedDate.toString() &&
        prevProps.drawnDays[0].date.toString() ===
            nextProps.drawnDays[0].date.toString() &&
        (prevProps.allowedDates
            ? prevProps.allowedDates.length === nextProps.allowedDates?.length
            : true) && // this might be an issue: if the allowed dates change but the total length doesn't, the body won't update
        prevProps.drawOverflow === nextProps.drawOverflow;

    return res;
});
