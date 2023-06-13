import {
    Box,
    Collapse,
    Flex,
    FormControl,
    FormLabel,
    Stack,
    Switch,
    useColorModeValue,
} from "@chakra-ui/react";
import { SelectionEvent } from "@viselect/react";
import { format } from "date-fns/esm";
import React, { useEffect, useState } from "react";
import useStateRef from "react-usestateref";
import { useTelegram } from "../../context/TelegramProvider";
import { ENCODER_SEPARATOR } from "../../lib/std";
import { removeDate } from "../../routes/meetup";
import { TimeSelection } from "../../types/types";
import { dateParser } from "../Calendar/CalendarContainer";
import TimeRangeSelector from "./TimeRangeSelector";
import TimeSelector from "./TimeSelector";

type TimeContainerProps = {
    datesSelected: string[];
    timesSelected: TimeSelection;
    setTimesSelected: React.Dispatch<React.SetStateAction<TimeSelection>>;
    setPristine: React.Dispatch<React.SetStateAction<boolean>>;
    pristine: boolean;

    startMin: number;
    endMin: number;
    setTime: React.Dispatch<React.SetStateAction<[number, number]>>;
    // @ts-ignore: this isn't exposed
    timeRef: ReadOnlyRefObject<[number, number]>;
    timeInitiallyOpen?: boolean;
};

/**
 * Converts the minutes since 0000 into a string in the format of h:mm am/pm.
 *
 * @param minutes the number of minutes since 00:00
 * @returns nice string
 */
const convertMinutesToAmPm = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const minutesLeft = minutes % 60;
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutesLeft < 10 ? `0${minutesLeft}` : minutesLeft;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

/**
 * Converts the minutes since 0000 into a string in the format of HHMM.
 * This is used for the first column, which is a header column.
 *
 * @param minutes the number of minutes since 00:00
 * @returns nice string
 *
 */
const convertMinutesTo24Hour = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const minutesLeft = minutes % 60;
    return `${hours < 10 ? `0${hours}` : hours}${minutesLeft}`;
};

/**
 * Converts the date string yyyy-MM-dd into two strings: "dd MMM" and "EEE"
 *
 * @param dateStr the date string
 * @returns an array of two strings
 */
const convertDateToDayAndMonth = (dateStr: string) => {
    const date = dateParser(dateStr);
    const string1 = format(date, "dd MMM");
    const string2 = format(date, "EEE");
    return [string1, string2];
};

const CELL_PADDING_LR = 1;
const CELL_PADDING_TB = 0;

const CELL_WIDTH = "48px";
const CELL_HEIGHT = "24px";
const COL_HEADER_CELL_WIDTH = "64px";

export type CellData = {
    row: number;
    col: number;
    value: string; // either the time value OR the current date string (yyyy-MM-dd)
    isClickable: boolean;
    isHeader: boolean;
    align?: "left" | "center" | "right";
};
/**
 * Creates an array that holds the 30 minute increments between start and end.
 *
 * @param start the start time
 * @param end the end time
 *
 * @returns an array of 30 minute increments in numbers [start, ..., end]
 */
export const create30MinuteIncrements = (
    start: number = 9 * 60,
    end: number = 17 * 60
) => {
    return Array.from(Array(Math.round((end - start) / 30)).keys()).map(
        (i) => start + i * 30
    );
};
/**
 * Contains all selections related to Time picking.
 *
 * @param param0 the props passed in
 * @returns
 */
const TimeContainer = ({
    datesSelected,
    timesSelected,
    setTimesSelected,
    setPristine,
    pristine,
    endMin,
    setTime,
    startMin,
    timeRef,
    timeInitiallyOpen = false,
}: TimeContainerProps) => {
    /**
     * Changes whether the times can be set for each individual date.
     */
    const toggleIndividualTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPristine(false);
        if (e.target.checked) {
            selectAll();

            setTouched(false);
        } else {
            // setTimesSelected([]);
        }
        setShowIndividualTimes(e.target.checked);
        setPreviousTimesSelected(timesSelected);
    };

    const { user, webApp, style } = useTelegram();
    const [_, setWebAppRef, webAppRef] = useStateRef(webApp);

    useEffect(() => {
        setWebAppRef(webApp);
    }, [webApp]);

    /**
     * There are bugs when dynamically adding new elements to the SelectionArea.
     * We perform a 'reset' by toggling the showIndividualTimes state.
     * This is a hacky solution.
     *
     * Works because we have set unmountOnExit={true} for the Collapse.
     */
    const updateSelectionArea = (e: [number, number]) => {
        // console.log({ e });
        setTime(e);
        // setTimesSelected([]);
        setTouched(false);

        // add the new times to the selection if and only if
        // newStart < currentStart
        // newEnd > currentEnd
        const newTimes: TimeSelection = [];
        // if (e[0] < startMin) {
        //     datesSelected.forEach((date) => {
        //         newTimes.push(
        //             ...create30MinuteIncrements(e[0], startMin).map(
        //                 (e) => `${e}${ENCODER_SEPARATOR}${date}`
        //             )
        //         );
        //     });
        // }

        // if (e[1] > endMin) {
        //     datesSelected.forEach((date) => {
        //         newTimes.push(
        //             ...create30MinuteIncrements(endMin - 30, e[1]).map(
        //                 (e) => `${e}${ENCODER_SEPARATOR}${date}`
        //             )
        //         );
        //     });
        // }

        if (pristine) {
            const flat = create30MinuteIncrements(
                timeRef.current[0],
                timeRef.current[1]
            );
            setTimesSelected(
                flat.flatMap((time) =>
                    datesSelected.map((date) => `${time}::${date}`)
                )
            );
        } else {
            // remove the ones that are no longer in the range
            setTimesSelected((prev) =>
                prev.filter(
                    (timeStr) =>
                        timeRef.current[0] <= Number(removeDate(timeStr)) &&
                        Number(removeDate(timeStr)) < timeRef.current[1]
                )
            );
        }

        // remove dupes
        // setTimesSelected((prev) => [...new Set([...prev, ...newTimes])]);

        // if (showIndividualTimes) {
        //     setTempShow(false)
        //     setTimeout(() => {
        //         setTempShow(true)
        //     }, 1)
        // }
    };

    // create an array that contains the startMins, every 30 minutes, until endMin
    // e.g. [540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840] for startMin = 530, endMin = 840
    const thirtyMinuteIncrements = create30MinuteIncrements(startMin, endMin);

    const [showIndividualTimes, setShowIndividualTimes] =
        useState(timeInitiallyOpen);
    const convertRowNumberToMinutes = (startMin: number, row: number) =>
        startMin + row * 30;

    const cellOutlineColor = useColorModeValue("gray.200", "gray.800");
    const cellSelectedColor = useColorModeValue("blue.200", "blue.800");
    const cellUnselectedColor = useColorModeValue("gray.100", "gray.900");

    /**
     * Generates the correct classname for a cell
     *
     * @param data the data of the cell that was clicked on
     * @returns the appropiate classname for the cell
     */
    const classNameGenerator = (data: CellData) => {
        let str = "selectable time";
        if (isSelectedCell(data)) str += " selected";
        return str;
    };

    /**
     * Checks if a cell has been selected
     *
     * @param data the data of the cell that was clicked on
     * @returns true if cell has been selected, false if not.
     */
    const isSelectedCell = (data: CellData) => {
        return timesSelected.includes(`${data.value}`);
    };

    const [touched, setTouched] = useState(true);

    const extractIds = (els: Element[]): string[] =>
        els
            .map((v) => v.getAttribute("data-key"))
            .filter(Boolean)
            .map(String);

    const onBeforeStart = ({ event, selection }: SelectionEvent) => {
        // selection.
        selection.clearSelection(true, true);
        selection.select(".selectable.selected.time", true);
        if ((event?.target as HTMLElement)?.className.includes("blocked")) {
            return false;
        } else {
            // selection.select(".selectable.selected");
            return true;
        }
        // return true;
    };

    const onStart = ({ event, selection, store }: SelectionEvent) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            // selection.clearSelection();
            // setSelected(() => new Set());
        }
    };

    /**
     * Tracks the previous times selected for comparison against when we
     * add / remove items by dragging
     *
     * Note: remember to update it with the new datesSelected when onStop() is called.
     */
    const [
        previousTimesSelected,
        setPreviousTimesSelected,
        previousTimesSelectedRef,
    ] = useStateRef<string[]>([...timesSelected]);
    /**
     * The type of drag selection.
     * 0: none
     * 1: adding
     * 2: remove
     *
     * Note: remember to reset it when onStop().
     */
    const [dragType, setDragType, dragTypeRef] = useStateRef(0);
    const onMove = ({
        store: {
            changed: { added, removed },
        },
    }: SelectionEvent) => {
        if (removed.length) {
            // we are in remove mode
            if (dragTypeRef.current == 0) {
                setDragType(2);
            }
        } else if (added.length) {
            // if something was added and it's the first item, set the mode to "select" mode.
            // in this case, do not deselect anything
            if (dragTypeRef.current == 0) {
                setDragType(1);
            }
        }

        if (dragTypeRef.current == 1) {
            // console.log("IN ADD MODE");

            setTimesSelected((prev) => {
                const startNum = prev.length;
                const next = new Set(prev);
                extractIds(added).forEach((id) => next.add(id));

                // only de-select if it was not present in previousDatesSelected
                extractIds(removed)
                    .filter(
                        (i) => !previousTimesSelectedRef.current.includes(i)
                    )
                    .forEach((id) => next.delete(id));

                const endNum = next.size;

                if (startNum != endNum) {
                    if (webAppRef.current?.HapticFeedback.selectionChanged) {
                        webAppRef.current.HapticFeedback.selectionChanged();
                    }
                }
                return [...next].sort();
            });
        } else if (dragTypeRef.current == 2) {
            // console.log("IN DELETEMODE");
            setTimesSelected((prev) => {
                const startNum = prev.length;
                const next = new Set(prev);
                // only re-select if it was present in previousDatesSelected
                extractIds(added)
                    .filter((i) => previousTimesSelectedRef.current.includes(i))
                    .forEach((id) => next.add(id));
                extractIds(removed).forEach((id) => next.delete(id));
                const endNum = next.size;
                if (startNum != endNum) {
                    if (webAppRef.current?.HapticFeedback.selectionChanged) {
                        webAppRef.current.HapticFeedback.selectionChanged();
                    }
                }
                return [...next].sort();
            });
        }

        // setTimesSelected((prev) => {
        //     const next = new Set(prev);

        //     extractIds(added).forEach((id) => next.add(id));
        //     extractIds(removed).forEach((id) => next.delete(id));

        //     return [...next];
        // });
        setTouched(true);
    };

    const onStop = ({ event, selection }: SelectionEvent) => {
        setPreviousTimesSelected(extractIds(selection.getSelection()));
        setDragType(0);
    };
    // console.log({ timesSelected });

    /**
     * Select everything in the selectionarea
     */
    const selectAll = () => {
        const newTimeSelection: TimeSelection = [];
        datesSelected.forEach((date) => {
            newTimeSelection.push(
                ...thirtyMinuteIncrements.map(
                    (e) => `${e}${ENCODER_SEPARATOR}${date}`
                )
            );
        });

        setTimesSelected(newTimeSelection);
        setPreviousTimesSelected(newTimeSelection);
    };

    /**
     * Deselect everything
     */
    const deselectAll = () => {
        setTimesSelected([]);
        setPreviousTimesSelected([]);
    };

    const _btnColor = useColorModeValue("#D6BCFA", "#553C9A");

    const btnColor = style?.button_color || _btnColor;

    return (
        <Box>
            <Stack mb={2}>
                <TimeRangeSelector
                    updateSelectionArea={updateSelectionArea}
                    startMin={startMin}
                    endMin={endMin}
                    setTime={setTime}
                />

                <FormControl>
                    <Flex direction={"row"} justifyContent="space-between">
                        <FormLabel
                            htmlFor="showIndividualTimes"
                            cursor="pointer"
                            m={0}
                        >
                            {" "}
                            Set time per day{" "}
                        </FormLabel>
                        <Switch
                            id="showIndividualTimes"
                            isChecked={showIndividualTimes}
                            onChange={toggleIndividualTime}
                            // https://github.com/chakra-ui/chakra-ui/discussions/6140
                            sx={{
                                "span.chakra-switch__track[data-checked]": {
                                    backgroundColor: btnColor,
                                },
                                // "span.chakra-switch__track:not([data-checked])": {
                                //     backgroundColor:
                                //         style?.secondary_bg_color,
                                // },
                            }}
                        />
                    </Flex>{" "}
                </FormControl>
            </Stack>
            <Collapse in={showIndividualTimes} unmountOnExit>
                <TimeSelector
                    // arrayToGenerate={arrayToGenerate}
                    classNameGenerator={classNameGenerator}
                    datesSelected={datesSelected}
                    deselectAll={deselectAll}
                    endMin={endMin}
                    startMin={startMin}
                    isSelectedCell={isSelectedCell}
                    selectAll={selectAll}
                    timesSelected={timesSelected}
                    onBeforeStart={onBeforeStart}
                    onMove={onMove}
                    onStart={onStart}
                    onStop={onStop}
                />
            </Collapse>
        </Box>
    );
};

type SelectableCellProps = {
    cellColor: string;
    className: string;
    data: CellData;
    cellOutlineColor: string;
    renderText?: boolean;
};

export default React.memo(TimeContainer);
