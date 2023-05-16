import {
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderMark,
    Stack,
    Text,
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
/**
 * Time picker for the start and end times of each day.
 *
 * @returns A range selector, with the start and end handles representing the start and end times of the event.
 */
const TimeRangeSelector = () => {
    const start = 0;
    const end = 24 * 60 - 1;

    const [[startMin, endMin], setTime] = useState([9 * 60, 17 * 60]);
    return (
        <Stack>
            <RangeSlider
                defaultValue={[9 * 60, 17 * 60]}
                min={start}
                max={end}
                step={30}
                onChange={(e) => setTime(e as [number, number])}
            >
                <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderMark
                    value={startMin}
                    textAlign="center"
                    bg="blue.800"
                    color="white"
                    m="15px 0 0 -50px"
                    w="100px"
                    borderRadius={4}
                >
                    {convertTimeIntoAMPM(startMin)}
                </RangeSliderMark>
                <RangeSliderMark
                    value={endMin}
                    textAlign="center"
                    bg="blue.800"
                    color="white"
                    m="15px 0 0 -50px"
                    w="100px"
                    borderRadius={4}
                >
                    {convertTimeIntoAMPM(endMin)}
                </RangeSliderMark>
                <RangeSliderThumb boxSize={4} index={0} />
                <RangeSliderThumb boxSize={4} index={1} />
            </RangeSlider>
            {/* <Text> Start: {convertTimeIntoAMPM(startMin)}</Text>
            <Text> End: {convertTimeIntoAMPM(endMin)}</Text> */}
        </Stack>
    );
};

export default TimeRangeSelector;
