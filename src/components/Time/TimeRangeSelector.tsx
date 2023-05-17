import {
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderMark,
    Stack,
    Text,
    Grid,
    Box,
} from "@chakra-ui/react";
import { useState } from "react";

/**
 * Converts a numerical value from 0 to 24*60 into a human-readable time string of the format
 * "hh:mm am/pm".
 *
 * @param time The time in minutes
 * @returns a nicely formatted string
 */
const convertTimeIntoAMPM = (time: number) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const convertTimeInto24Hour = (time: number) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}:${minutes}`;
};

type TimeRangeSelectorProps = {
    startMin: number;
    endMin: number;
    setTime: React.Dispatch<React.SetStateAction<[number, number]>>;
    updateSelectionArea: (e: [number, number]) => void
};

/**
 * Time picker for the start and end times of each day.
 *
 * @returns A range selector, with the start and end handles representing the start and end times of the event.
 */
const TimeRangeSelector = ({
    startMin,
    endMin,
    setTime,
    updateSelectionArea
}: TimeRangeSelectorProps) => {
    const start = 0;
    const end = 24 * 60 - 1;

    const [[localStart, localEnd], setLocals] = useState([9 * 60, 17 * 60]);

    return (
        <Stack data-testid="timerange-component">
            <RangeSlider
                defaultValue={[9 * 60, 17 * 60]}
                min={start}
                max={end}
                step={30}
                onChange={(e) => {
                    // if (e[1] == e[0]) return;
                    setLocals(e as [number, number]);
                }}
                onChangeEnd={(e) => updateSelectionArea(e as [number, number])}
            >
                <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderMark
                    value={localStart}
                    textAlign="center"
                    bg="blue.800"
                    color="white"
                    m="15px 0 0 -50px"
                    w="100px"
                    borderRadius={4}
                >
                    {convertTimeIntoAMPM(localStart)}
                </RangeSliderMark>
                <RangeSliderMark
                    value={localEnd}
                    textAlign="center"
                    bg="blue.800"
                    color="white"
                    m="15px 0 0 -50px"
                    w="100px"
                    borderRadius={4}
                >
                    {convertTimeIntoAMPM(localEnd)}
                </RangeSliderMark>
                <RangeSliderThumb boxSize={4} index={0} />
                <RangeSliderThumb boxSize={4} index={1} />
            </RangeSlider>
            {/* <Text> Start: {convertTimeIntoAMPM(startMin)}</Text>
            <Text> End: {convertTimeIntoAMPM(endMin)}</Text> */}
            <Box height={12} />
        </Stack>
    );
};

export default TimeRangeSelector;
