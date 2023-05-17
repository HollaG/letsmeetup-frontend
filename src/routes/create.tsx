import {
    Button,
    Container,
    Heading,
    Input,
    Stack,
    Text,
    useColorMode,
} from "@chakra-ui/react";
import { useState } from "react";
import CalendarContainer from "../components/Calendar/CalendarContainer";
import TimeContainer from "../components/Time/TimeContainer";
import TimeRangeSelector from "../components/Time/TimeRangeSelector";
import { TimeSelection } from "../types/types";

const Create = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    const [datesSelected, setDatesSelected] = useState<string[]>([]);

    const [timesSelected, setTimesSelected] = useState<TimeSelection>([]);

    

    return (
        <Stack spacing={4}>
            <Button onClick={toggleColorMode}> toggle mode </Button>
            <Heading fontSize={"xl"}> Create a new event </Heading>
            <Input id="title" placeholder="Event title" required />
            <Input
                id="description"
                placeholder="Event description (optional)"
            />
            <Heading fontSize={"xl"} pt={6}>
                {" "}
                Select the possible event dates{" "}
            </Heading>

            <CalendarContainer
                datesSelected={datesSelected}
                setDatesSelected={setDatesSelected}
            />
            <Heading fontSize={"xl"} pt={6}>
                {" "}
                Select the possible event timings{" "}
            </Heading>
            <TimeContainer
                datesSelected={datesSelected}
                setTimesSelected={setTimesSelected}
                timesSelected={timesSelected}
            />
        </Stack>
    );
};

export default Create;
