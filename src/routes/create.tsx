import {
    Button,
    Container,
    Heading,
    Input,
    Stack,
    Text,
    useColorMode,
} from "@chakra-ui/react";
import CalendarContainer from "../components/Calendar/CalendarContainer";
import TimeRangeSelector from "../components/Time/TimeRangeSelector";

const Create = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    return (
        <Stack spacing={4}>
            <Button onClick={toggleColorMode}> toggle mode </Button>
            <Heading fontSize={"xl"}> Create a new event </Heading>
            <Input placeholder="Event title" required />
            <Input placeholder="Event description (optional)" />
            <Heading fontSize={"xl"} pt={6}>
                {" "}
                Select the possible event dates{" "}
            </Heading>

            <CalendarContainer />
            <Heading fontSize={"xl"} pt={6}>
                {" "}
                Select the possible event timings{" "}
            </Heading>

            <TimeRangeSelector />
        </Stack>
    );
};

export default Create;
