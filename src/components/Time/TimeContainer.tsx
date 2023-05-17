import {
    Box,
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
import { ENCODER_SEPARATOR } from "../../lib/std";
import { TimeSelection } from "../../types/types";
import { dateParser } from "../Calendar/CalendarContainer";
import TimeRangeSelector from "./TimeRangeSelector";

type TimeContainerProps = {
    datesSelected: string[];
    timesSelected: TimeSelection;
    setTimesSelected: React.Dispatch<React.SetStateAction<TimeSelection>>;
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

type CellData = {
    row: number;
    col: number;
    value: string; // either the time value OR the current date string (yyyy-MM-dd)
    isClickable: boolean;
    isHeader: boolean;
    align?: "left" | "center" | "right";
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
}: TimeContainerProps) => {
    const [[startMin, endMin], setTime] = useState([9 * 60, 17 * 60]); // in minutes
    const [[prevStartMin, prevEndMin], setPrevTime] = useState([
        9 * 60,
        17 * 60,
    ]); // in minutes
    console.log({ timesSelected });
    /**
     *
     */
    const toggleIndividualTime = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newTimeSelection: TimeSelection = [];
            setTouched(false);
            // datesSelected.forEach((date) => {
            //     newTimeSelection.push(
            //         ...thirtyMinuteIncrements.map(
            //             (e) => `${e}${ENCODER_SEPARATOR}${date}`
            //         )
            //     );
            // });
            // setTimesSelected(newTimeSelection);
        } else {
            // setTimesSelected([]);
        }
        setShowIndividualTimes(e.target.checked);
    };

    const [tempShow, setTempShow] = useState(true);

    /**
     * There are bugs when dynamically adding new elements to the SelectionArea.
     * We perform a 'reset' by toggling the showIndividualTimes state.
     * This is a hacky solution.
     *
     * Works because we have set unmountOnExit={true} for the Collapse.
     */
    const updateSelectionArea = (e: [number, number]) => {

        setTime(e);
        setTimesSelected([]);
        setTouched(false);
        if (showIndividualTimes) {
            setTempShow(false)
            setTimeout(() => {
                setTempShow(true)
            }, 10)
        }
    };

    // create an array that contains the startMins, every 30 minutes, until endMin
    // e.g. [540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840] for startMin = 530, endMin = 840
    const thirtyMinuteIncrements = Array.from(
        Array(Math.round((endMin - startMin) / 30)).keys()
    ).map((i) => startMin + i * 30);

    const convertRowNumberToMinutes = (startMin: number, row: number) =>
        startMin + row * 30;

    // Calculate the number of 'divisions'
    const divisions = Math.round((endMin - startMin) / 30); // can be zero
    const arrayDiv = Array.from(Array(divisions).keys());

    const [showIndividualTimes, setShowIndividualTimes] = useState(false);

    const arrayToGenerate: CellData[][] = arrayDiv.map((r) => [
        {
            row: r,
            col: -1,
            value: convertMinutesToAmPm(convertRowNumberToMinutes(startMin, r)),
            isClickable: false,
            isHeader: true,
        },
        ...datesSelected.map((d, i) => ({
            row: r,
            col: i,
            value: `${convertRowNumberToMinutes(
                startMin,
                r
            )}${ENCODER_SEPARATOR}${d}`,
            isClickable: true,
            isHeader: false,
        })),
        {
            row: r,
            col: -1,
            value: convertMinutesToAmPm(convertRowNumberToMinutes(startMin, r)),
            isClickable: false,
            isHeader: true,
            align: "left",
        },
    ]);

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
        let str = "selectable";
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
        // const ranges = timesSelected[data.value];
        // if (!ranges) return false;
        // const thisTimeInMinutes = convertRowNumberToMinutes(startMin, data.row);
        // // return ranges.find(
        // //     (range) =>
        // //         range.start <= thisTimeInMinutes &&
        // //         range.end > thisTimeInMinutes
        // // );
        // return ranges.includes(thisTimeInMinutes);
    };

    /**
     * Update the timesSelected object every time the time range changes.
     */
    // useEffect(() => {
    //     // todo: don't auto-select if user has touched the table.
    //     // or: dn't auto select if table is open

    //     // To timesSelected, for each day,

    //     const newTimeSelection: TimeSelection = [];
    //     setTouched(false);
    //     datesSelected.forEach((date) => {
    //         newTimeSelection.push(
    //             ...thirtyMinuteIncrements.map(
    //                 (e) => `${e}${ENCODER_SEPARATOR}${date}`
    //             )
    //         );
    //     });
    //     setTimesSelected(newTimeSelection);
    //     setPrevTime([startMin, endMin]);
    // }, [startMin, endMin, datesSelected]);

    const [touched, setTouched] = useState(true);

    const extractIds = (els: Element[]): string[] =>
        els
            .map((v) => v.getAttribute("data-key"))
            .filter(Boolean)
            .map(String);

    const onBeforeStart = useCallback(({ event, selection }: SelectionEvent) => {
        
        if ((event?.target as HTMLElement)?.className.includes("blocked")) {
            return false;
        } else {
           
            // selection.select(".selectable.selected");
            return true;
        }
    }, [touched]);
    console.log({touched}, "outside")

    const onStart = ({ event, selection }: SelectionEvent) => {
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
        if (added.length) console.log({ added: extractIds(added) });
        if (removed.length) console.log({ removed: extractIds(removed) });

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

    const onStop = ({ event, selection }: SelectionEvent) =>
        console.log({ timesSelected });

    return (
        <Stack>
            <TimeRangeSelector
                updateSelectionArea={updateSelectionArea}
                startMin={startMin}
                endMin={endMin}
                setTime={setTime}
            />
            <Divider />

            <Flex direction={"row"} justifyContent="space-between">
                <Text> Set individual date times </Text>
                <Switch
                    isChecked={showIndividualTimes}
                    onChange={toggleIndividualTime}
                />
            </Flex>
            {tempShow && <Collapse in={showIndividualTimes}>
                <Box>
                    <Box
                        as={SelectionArea}
                        className="select-container"
                        onBeforeStart={onBeforeStart}
                        onStart={onStart}
                        onMove={onMove}
                        onStop={onStop}
                        selectables=".selectable"
                        display="grid"
                        gridTemplateColumns={`repeat(${
                            datesSelected.length + 2
                        }, 1fr)`}
                        width="100%"
                        maxHeight="480px"
                        userSelect="none"
                        overflow="auto"
                        behaviour={{
                            overlap: "invert",
                            intersect: "touch",
                            startThreshold: 10,
                            scrolling: {
                                speedDivider: 10,
                                manualSpeed: 750,
                                startScrollMargins: {
                                    x: 64,
                                    y: 64,
                                },
                            },
                        }}
                    >
                        {/* This box is for the unused cell at top left. */}
                        <Box
                            width={COL_HEADER_CELL_WIDTH}
                            bgColor="unset"
                            pr={1}
                        />
                        {datesSelected.map((d, i) => (
                            <Box
                                minWidth={CELL_WIDTH}
                                fontSize={"xs"}
                                textAlign={"center"}
                                fontWeight="normal"
                                // mx={CELL_PADDING_LR}
                                // my={CELL_PADDING_TB}
                                textTransform="unset"
                                p={0}
                                key={i}
                                className="blocked"
                            >
                                {convertDateToDayAndMonth(d)[0]}
                                <br />
                                {convertDateToDayAndMonth(d)[1]}
                            </Box>
                        ))}
                        <Box
                            width={COL_HEADER_CELL_WIDTH}
                            bgColor="unset"
                            pr={1}
                        />

                        {arrayToGenerate.map((rows, r) =>
                            rows.map((data, c) => (
                                <TableCell
                                    key={`${data.value}-${r}-${c}`}
                                    cellColor={
                                        isSelectedCell(data)
                                            ? cellSelectedColor
                                            : cellUnselectedColor
                                    }
                                    data={data}
                                    className={classNameGenerator(data)}
                                    cellOutlineColor={cellOutlineColor}
                                    // renderText={r % 2 == 0}
                                />
                            ))
                        )}
                        {/* This cell provides the last timing. */}
                        <TableCell
                            cellColor={cellUnselectedColor}
                            className="blocked"
                            cellOutlineColor="unset"
                            data={{
                                value: convertMinutesToAmPm(convertRowNumberToMinutes(startMin, arrayToGenerate.length)),
                                col: -1,
                                row: arrayToGenerate.length,
                                isClickable: false,
                                isHeader: true,
                                
                            }}
                        />
                        {datesSelected.map((d, i) => (
                            <Box
                                minWidth={CELL_WIDTH}
                                fontSize={"xs"}
                                textAlign={"center"}
                                fontWeight="normal"
                                // mx={CELL_PADDING_LR}
                                // my={CELL_PADDING_TB}
                                textTransform="unset"
                                p={0}
                                key={i + datesSelected.length}
                                className="blocked"
                            >
                                {convertDateToDayAndMonth(d)[0]}
                                <br />
                                {convertDateToDayAndMonth(d)[1]}
                            </Box>
                        ))}
                        <TableCell
                            cellColor={cellUnselectedColor}
                            className="blocked"
                            cellOutlineColor="unset"
                            data={{
                                value: convertMinutesToAmPm(convertRowNumberToMinutes(startMin, arrayToGenerate.length)),
                                col: -1,
                                row: arrayToGenerate.length,
                                isClickable: false,
                                isHeader: true,
                                align: "left"
                            }}
                        />
                    </Box>
                </Box>
            </Collapse>}
        </Stack>
    );
};

type SelectableCellProps = {
    cellColor: string;
    className: string;
    data: CellData;
    cellOutlineColor: string;
    renderText?: boolean
};

const TableCell =
    // React.memo
    // (
    ({ cellColor, data, className, cellOutlineColor, renderText = true }: SelectableCellProps) => {
        // console.log({ data });
        // console.log(`tablecell ${data.value} rendered`);
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
