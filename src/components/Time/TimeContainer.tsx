import {
    Box,
    Button,
    Collapse,
    Divider,
    Flex,
    Grid,
    GridItem,
    HStack,
    Stack,
    Switch,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
} from "@chakra-ui/react";
import SelectionArea, { SelectionEvent } from "@viselect/react";
import { format } from "date-fns/esm";
import React, { useCallback, useEffect, useState } from "react";
import useStateRef from "react-usestateref";
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
    timeRef: ReadOnlyRefObject<[number, number]>
};

/**
 * Converts the minutes since 0000 into a string in the format of HH:MM am/pm.
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
    timeRef
}: TimeContainerProps) => {
    
    /**
     *
     */
    const toggleIndividualTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPristine(false)
        if (e.target.checked) {
            selectAll();

            setTouched(false);
        } else {
            // setTimesSelected([]);
        }
        setShowIndividualTimes(e.target.checked);
    };

    /**
     * There are bugs when dynamically adding new elements to the SelectionArea.
     * We perform a 'reset' by toggling the showIndividualTimes state.
     * This is a hacky solution.
     *
     * Works because we have set unmountOnExit={true} for the Collapse.
     */
    const updateSelectionArea = (e: [number, number]) => {
        console.log({ e });
        setTime(e);
        // setTimesSelected([]);
        setTouched(false);

        // add the new times to the selection if and only if
        // newStart < currentStart
        // newEnd > currentEnd
        let newTimes: TimeSelection = [];
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
            const flat = create30MinuteIncrements(timeRef.current[0], timeRef.current[1])
            setTimesSelected(flat.flatMap(time => datesSelected.map(date => `${time}::${date}`)));
        } else { 
            // remove the ones that are no longer in the range
            setTimesSelected((prev) =>
                prev.filter((timeStr) => timeRef.current[0] <= Number(removeDate(timeStr)) && Number(removeDate(timeStr)) < timeRef.current[1])
            )
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

    const [showIndividualTimes, setShowIndividualTimes] = useState(false);
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
    };

    const onStart = ({ event, selection, store }: SelectionEvent) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            // selection.clearSelection();
            // setSelected(() => new Set());
        }
    };
    const onMove = ({
        store: {
            changed: { added, removed },
        },
    }: SelectionEvent) => {
        // if (added.length) console.log({ added: extractIds(added) });
        // if (removed.length) console.log({ removed: extractIds(removed) });

        setTimesSelected((prev) => {
            const next = new Set(prev);
            // if (!touched) {
            //     extractIds(added).forEach((id) => next.delete(id));
            //     extractIds(removed).forEach((id) => next.add(id));
            // } else {
            extractIds(added).forEach((id) => next.add(id));
            extractIds(removed).forEach((id) => next.delete(id));
            // }

            // console.log({ next });
            return [...next];
        });
        setTouched(true);
    };

    const onStop = ({ event, selection }: SelectionEvent) => {};
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
    };

    /**
     * Deselect everything
     */
    const deselectAll = () => {
        setTimesSelected([]);
    };

    return (
        <Stack>
            <TimeRangeSelector
                updateSelectionArea={updateSelectionArea}
                startMin={startMin}
                endMin={endMin}
                setTime={setTime}
            />

            <Flex direction={"row"} justifyContent="space-between">
                <Text> Set time per day </Text>
                <Switch
                    isChecked={showIndividualTimes}
                    onChange={toggleIndividualTime}
                />
            </Flex>

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
        </Stack>
    );
};

type SelectableCellProps = {
    cellColor: string;
    className: string;
    data: CellData;
    cellOutlineColor: string;
    renderText?: boolean;
};

const TableCell =
    // React.memo
    // (
    ({
        cellColor,
        data,
        className,
        cellOutlineColor,
        renderText = true,
    }: SelectableCellProps) => {
        if (data.isHeader) {
            return (
                <Box
                    minWidth={COL_HEADER_CELL_WIDTH}
                    height={CELL_HEIGHT}
                    bgColor="unset"
                    px={1}
                    display="flex"
                    justifyContent={data.align || "right"}
                    alignItems="center"
                    className="blocked"
                >
                    <Text
                        fontSize={"xs"}
                        marginTop={`-${CELL_HEIGHT}`}
                        className="blocked"
                    >
                        {renderText && data.value}
                    </Text>
                </Box>
            );
        }
        return (
            <Box
                minWidth={CELL_WIDTH}
                height={CELL_HEIGHT}
                bgColor={cellColor}
                className={className}
                data-key={data.value}
                outline="1px dashed"
                outlineColor={cellOutlineColor}
            ></Box>
        );
    };
// ,
// (prevProps, nextProps) => {
//     return (
//         prevProps.cellColor == nextProps.cellColor &&
//         prevProps.className == nextProps.className &&
//         prevProps.cellOutlineColor == nextProps.cellOutlineColor &&
//         prevProps.data.value == nextProps.data.value
//     );
// }
// );

export default React.memo(TimeContainer);