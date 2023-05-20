import {
    Avatar,
    Box,
    Divider,
    Flex,
    Grid,
    GridItem,
    Heading,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { Meetup } from "../../db/repositories/meetups";
import {
    RANGE_EMPTY_LIGHT,
    RANGE_EMPTY_DARK,
    RANGE_0_LIGHT,
    RANGE_0_DARK,
    RANGE_1_LIGHT,
    RANGE_1_DARK,
    RANGE_2_LIGHT,
    RANGE_2_DARK,
    RANGE_3_LIGHT,
    RANGE_3_DARK,
    RANGE_4_LIGHT,
    RANGE_4_DARK,
    RANGE_FULL_LIGHT,
    RANGE_FULL_DARK,
} from "../../lib/std";
import { assignColor, RangeColors } from "../../utils/availabilityList.utils";
import { dateParser } from "../Calendar/CalendarContainer";
import ColorExplainer from "./common/ColorExplainer";
import DisplayBox from "./common/DisplayBox";

const CELL_WIDTH = "36px";
const CELL_WIDTH_NUM = 36;
const FILLER_WIDTH = 6;
const CELL_HEIGHT = "24px";
const CELL_HEIGHT_NUM = 24;

type ByDateListProps = {
    meetup: Meetup;
};

/**
 * Only renders when isFullDay = true
 *
 * @returns
 */
const ByDateList = ({ meetup }: ByDateListProps) => {
    const range_empty = useColorModeValue(RANGE_EMPTY_LIGHT, RANGE_EMPTY_DARK);
    const range_0 = useColorModeValue(RANGE_0_LIGHT, RANGE_0_DARK);
    const range_1 = useColorModeValue(RANGE_1_LIGHT, RANGE_1_DARK);
    const range_2 = useColorModeValue(RANGE_2_LIGHT, RANGE_2_DARK);
    const range_3 = useColorModeValue(RANGE_3_LIGHT, RANGE_3_DARK);
    const range_4 = useColorModeValue(RANGE_4_LIGHT, RANGE_4_DARK);
    const range_full = useColorModeValue(RANGE_FULL_LIGHT, RANGE_FULL_DARK);

    const colors: RangeColors = [
        range_empty,
        range_0,
        range_1,
        range_2,
        range_3,
        range_4,
        range_full,
    ];
    const bgColor = useColorModeValue("gray.100", "gray.900");
    const pageBackgroundColor = useColorModeValue("white", "gray.800");
    // preformat: for each day, check if there is at least one person who is available
    const dates = meetup.dates.filter(
        (date) =>
            meetup.selectionMap[date] && meetup.selectionMap[date].length > 0
    );

    const numberOfUsers = meetup.users.length;
    return (
        <Grid
            gridTemplateColumns={`${CELL_WIDTH_NUM + FILLER_WIDTH}px 1fr`}
            width="100%"
            gap={0}
        >
            <GridItem
                colSpan={2}
                display="flex"
                justifyContent={"center"}
                alignItems="center"
                mb={3}
            >
                <ColorExplainer numTotal={meetup.users.length}/>
            </GridItem>
            {dates.flatMap((date) => [
                <GridItem colSpan={2} key={`${date}-1`} mb={2} display="flex">
                    <Stack width="100%">
                        <Divider borderWidth={"2px"} />
                        <Heading fontSize="lg">
                            {" "}
                            {format(dateParser(date), "EEEE, d MMMM yyyy")}{" "}
                        </Heading>
                    </Stack>
                </GridItem>,
                <GridItem
                    key={`${date}-2`}
                    display="flex"
                    height="100%"
                    // alignItems={"center"}
                    pb={2}
                >
                    <Stack spacing={0} height="100%">
                        <Stack spacing={1} flexDir="column">
                            <Flex>
                                <DisplayBox
                                    bgColor={assignColor(
                                        numberOfUsers,
                                        meetup.selectionMap[date]
                                            ? meetup.selectionMap[date].length
                                            : 0,
                                        colors
                                    )}
                                    height={CELL_HEIGHT_NUM}
                                >
                                    {Math.round(
                                        ((meetup.selectionMap[date]
                                            ? meetup.selectionMap[date].length
                                            : 0) /
                                            numberOfUsers) *
                                            100
                                    )}
                                    %
                                </DisplayBox>

                                <Box
                                    w={`${FILLER_WIDTH}px`}
                                    bgColor={bgColor}
                                    height={`${CELL_HEIGHT_NUM}px`}
                                ></Box>
                            </Flex>
                        </Stack>
                        <Box
                            w="100%"
                            height="45%"
                            bgColor={bgColor}
                            position="relative"
                        >
                            <Box
                                w="100%"
                                height="100%"
                                bgColor={pageBackgroundColor}
                                position="absolute"
                                borderRadius="0 4px 0 0"
                            ></Box>
                        </Box>
                    </Stack>
                </GridItem>,
                <GridItem
                    key={`${date}-3`}
                    bgColor={bgColor}
                    mb={2} // TODO: change mb to pb if combining
                    // TODO: see the lower one, #styling
                    borderRadius="0 4px 4px 0"
                >
                    <SimpleGrid columns={2} spacing={3} p={3}>
                        {meetup.selectionMap[date] &&
                            meetup.selectionMap[date].map((user, i) => (
                                <Box key={i}>
                                    <Flex alignItems="center">
                                        <Avatar
                                            name={`${user.first_name} ${user.last_name}`}
                                            src={user.photo_url}
                                            size="xs"
                                        />
                                        <Text ml={2}>{user.first_name}</Text>
                                    </Flex>
                                </Box>
                            ))}
                    </SimpleGrid>
                </GridItem>,
            ])}
        </Grid>
    );
};

export default ByDateList;
