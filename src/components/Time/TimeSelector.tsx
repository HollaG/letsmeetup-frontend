import {
    Stack,
    Flex,
    Button,
    Box,
    useColorModeValue,
    Text,
    Progress,
    Center,
    Heading,
    Collapse,
} from "@chakra-ui/react";
import SelectionArea, { SelectionEvent } from "@viselect/react";
import { format } from "date-fns";
import React from "react";
import { isMobile } from "react-device-detect";
import useStateRef from "react-usestateref";
import { useTelegram } from "../../context/TelegramProvider";
import { ENCODER_SEPARATOR } from "../../lib/std";
import { dateParser } from "../Calendar/CalendarContainer";
import HelperText from "../Display/HelperText";

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

const convertRowNumberToMinutes = (startMin: number, row: number) =>
    startMin + row * 30;

/**
 * Converts the minutes since 0000 into a string in the format of h:mm am/pm.
 *
 * @param minutes the number of minutes since 00:00
 * @returns nice string
 */
export const convertMinutesToAmPm = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const minutesLeft = minutes % 60;
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutesLeft < 10 ? `0${minutesLeft}` : minutesLeft;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

type TimeSelectorProps = {
    selectAll: () => void;
    deselectAll: () => void;
    datesSelected: string[];
    timesSelected: string[];
    onBeforeStart?: ({ event, selection }: SelectionEvent) => boolean;
    onStart?: ({ event, selection }: SelectionEvent) => void;
    onMove?: ({ event, selection }: SelectionEvent) => void;
    onStop?: ({ event, selection }: SelectionEvent) => void;
    // arrayToGenerate: CellData[][];
    isSelectedCell: (data: CellData) => boolean;
    classNameGenerator: (data: CellData) => string;

    startMin: number;
    endMin: number;

    allowedTimes?: string[];
};

const TimeSelector = ({
    classNameGenerator,
    isSelectedCell,
    // arrayToGenerate,
    selectAll,
    deselectAll,
    datesSelected,
    timesSelected,
    onBeforeStart,
    onMove,
    onStart,
    onStop,
    startMin,
    endMin,
    allowedTimes,
}: TimeSelectorProps) => {
    const cellOutlineColor = useColorModeValue("gray.200", "gray.800");
    const _cellSelectedColor = useColorModeValue("purple.200", "purple.800");
    const cellUnselectedColor = useColorModeValue("gray.100", "gray.900");

    const { style } = useTelegram();

    const _disabledBtnColor = useColorModeValue("#EDF2F7", "#1A202C");
    const _enabledTextColor = useColorModeValue("#ffffff", "#000000");
    const _disabledTextColor = useColorModeValue("#000000", "#ffffff");

    const cellSelectedColor = style?.button_color || _cellSelectedColor;
    const disabledBtnColor = style?.secondary_bg_color || _disabledBtnColor;
    const enabledTextColor = style?.button_text_color || _enabledTextColor;
    const disabledTextColor = style?.text_color || _disabledTextColor;

    const divisions = Math.round((endMin - startMin) / 30); // can be zero
    const arrayDiv = Array.from(Array(divisions).keys());

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

    const _onBeforeStart = (e: SelectionEvent) => {
        return onBeforeStart ? onBeforeStart(e) : true;
    };
    const _onStart = (e: SelectionEvent) => {
        onStart && onStart(e);
    };
    const _onMove = (e: SelectionEvent) => {
        onMove && onMove(e);
    };
    const _onStop = (e: SelectionEvent) => {
        onStop && onStop(e);
    };

    return (
        <Collapse in={!!datesSelected.length}>
            <Stack>
                <Box>
                    <Heading fontSize={"lg"}>
                        {" "}
                        🕔 Select your available times{" "}
                    </Heading>
                    <HelperText>
                        {" "}
                        {isMobile ? "Touch / Touch" : "Click / click"} and drag
                        to select.
                    </HelperText>

                    {isMobile && (
                        <HelperText>
                            Scroll by dragging along the labels.
                        </HelperText>
                    )}
                </Box>
                <Flex justifyContent="end">
                    <Button
                        size="xs"
                        // backgroundColor={style?.button_color}
                        // sx={{
                        //     ":hover": {
                        //         backgroundColor: style?.button_color
                        //     }
                        // }}
                        onClick={selectAll}
                    >
                        {" "}
                        Select all{" "}
                    </Button>
                    <Button
                        size="xs"
                        colorScheme="red"
                        ml={2}
                        onClick={deselectAll}
                    >
                        {" "}
                        Deselect all{" "}
                    </Button>
                </Flex>
                <Box
                    as={SelectionArea}
                    className="select-container"
                    onBeforeStart={_onBeforeStart}
                    onStart={_onStart}
                    onMove={_onMove}
                    onStop={_onStop}
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
                    features={{
                        singleTap: {
                            allow: true,
                            intersect: "touch",
                        },
                        // Enable / disable touch support.
                        touch: true,

                        // Range selection.
                        range: true,
                    }}
                >
                    {/* This box is for the unused cell at top left. */}
                    <Box width={COL_HEADER_CELL_WIDTH} bgColor="unset" pr={1} />
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
                    <Box width={COL_HEADER_CELL_WIDTH} bgColor="unset" pr={1} />

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
                                isAllowed={allowedTimes?.includes(data.value)}
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
                            value: convertMinutesToAmPm(
                                convertRowNumberToMinutes(
                                    startMin,
                                    arrayToGenerate.length
                                )
                            ),
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
                            value: convertMinutesToAmPm(
                                convertRowNumberToMinutes(
                                    startMin,
                                    arrayToGenerate.length
                                )
                            ),
                            col: -1,
                            row: arrayToGenerate.length,
                            isClickable: false,
                            isHeader: true,
                            align: "left",
                        }}
                    />
                </Box>
            </Stack>{" "}
        </Collapse>
    );
};

type SelectableCellProps = {
    cellColor: string;
    className: string;
    data: CellData;
    cellOutlineColor: string;
    renderText?: boolean;
    isAllowed?: boolean;
};

const TableCell = React.memo(
    ({
        cellColor,
        data,
        className,
        cellOutlineColor,
        renderText = true,
        isAllowed = true,
    }: SelectableCellProps) => {
        const notAllowedStripeColor1 = useColorModeValue("gray.200", "#2D3748");
        const notAllowedStripeColor2 = useColorModeValue(
            "purple.200",
            "purple.900"
        );

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
        if (isAllowed)
            return (
                <Center
                    minWidth={CELL_WIDTH}
                    height={CELL_HEIGHT}
                    bgColor={cellColor}
                    className={className}
                    data-key={data.value}
                    outline="1px dashed"
                    outlineColor={cellOutlineColor}
                    borderRadius={4}
                >
                    {/* <Progress value={Math.random() * 100} w="50%" height="15%" borderRadius="16px"/>  */}
                    {/* <Box w="100%" height="100%" borderRadius="16px" bgColor={`green.${(Math.round(Math.random()*10))*100}`}>

                    </Box> */}
                </Center>
            );
        else {
            return (
                <Box
                    minWidth={CELL_WIDTH}
                    height={CELL_HEIGHT}
                    bgColor={"unset"}
                    data-key={data.value}
                    outline="1px dashed"
                    outlineColor={cellOutlineColor}
                    // backgroundImage={`linear-gradient(45deg, ${notAllowedStripeColor1} 25%, ${notAllowedStripeColor2} 25%, ${notAllowedStripeColor2} 50%, ${notAllowedStripeColor1} 50%, ${notAllowedStripeColor1} 75%, ${notAllowedStripeColor2} 75%, ${notAllowedStripeColor2} 100%);`}
                    // background-size="40.00px 40.00px"
                    background={` 
                    linear-gradient(to top left,
                        rgba(0,0,0,0) 0%,
                        rgba(0,0,0,0) calc(50% - 0.8px),
                        ${notAllowedStripeColor1} 50%,
                        rgba(0,0,0,0) calc(50% + 0.8px),
                        rgba(0,0,0,0) 100%),
                    linear-gradient(to top right,
                        rgba(0,0,0,0) 0%,
                        rgba(0,0,0,0) calc(50% - 0.8px),
                        ${notAllowedStripeColor1} 50%,
                        rgba(0,0,0,0) calc(50% + 0.8px),
                        rgba(0,0,0,0) 100%);`}
                ></Box>
            );
        }
    },
    (prev, next) =>
        prev.cellColor === next.cellColor &&
        prev.cellOutlineColor === next.cellOutlineColor &&
        prev.className === next.className &&
        prev.isAllowed === next.isAllowed // for live updating of allowed
    // prev.data
);

export default TimeSelector;
