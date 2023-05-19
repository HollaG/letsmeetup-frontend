import {
    Avatar,
    Box,
    Center,
    Divider,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    SimpleGrid,
    Stack,
    Text,
    useColorMode,
    useColorModeValue,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";
import { Meetup } from "../../db/repositories/meetups";
import { removeDate } from "../../routes/meetup";
import { dateParser } from "../Calendar/CalendarContainer";
import { create30MinuteIncrements } from "../Time/TimeContainer";
import { convertMinutesToAmPm } from "../Time/TimeSelector";

type ByTimeListProps = {
    meetup: Meetup;
};

/**
 * Only renders when isFullDay = false.
 *
 * @param param0 The meetup to render
 * @returns React Component
 */
const ByTimeList = ({ meetup }: ByTimeListProps) => {
    // only draw for
    // temporary array of length meetup.timeslots

    const times = [...new Set(meetup.timeslots.map(removeDate))].sort();

    const startMin = meetup.timeslots.length ? times[0] : 0;
    const endMin = meetup.timeslots.length
        ? times[times.length - 1] + 30 // add 30 because the value gotten is the START of the 30-min slot
        : 24 * 60;

    // console.log({startMin, endMin})
    const arr = create30MinuteIncrements(startMin, endMin);

    const numberOfUsers = meetup.users.length;

    const range_empty = useColorModeValue("red.300", "red.800");
    const range_0 = useColorModeValue("red.100", "red.600");
    const range_1 = useColorModeValue("green.100", "green.400");
    const range_2 = useColorModeValue("green.200", "green.500");
    const range_3 = useColorModeValue("green.300", "green.600");
    const range_4 = useColorModeValue("green.400", "green.700");
    const range_full = useColorModeValue("green.500", "green.800");

    const colors = [
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
    const lineColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");

    /**
     * Gets the correct intensity of the color, based on the % of people who can attend
     *
     * @param totalNum The total number of people who have interacted with the calendar // TODO: Check if we need to remove users when they remove all their selections
     * @param amount The number of people who have selected this time slot
     * @returns the correct color in the scale
     */
    const assignColor = (totalNum: number, amount: number) => {
        const percent = amount / totalNum;
        if (percent === 0) {
            return range_empty;
        }
        if (percent < 0.2) {
            return range_0;
        }
        if (percent < 0.4) {
            return range_1;
        }
        if (percent < 0.6) {
            return range_2;
        }
        if (percent < 0.8) {
            return range_3;
        }
        if (percent < 1) {
            return range_4;
        }
        return range_full;
    };

    /**
     * Checks to see if the next timing has people who selected it.
     *
     * e.g. if the current time is 12:00pm, and the next time is 12:30pm,
     * this function will check if anyone selected 12:30pm
     *
     * If the next time slot is the next day, always return false
     *
     * @param dateTimeStr the current time to check the next date of
     * @returns true if the next time slot has people who selected it
     */
    const checkIfNextTimeSlotHasPeople = (dateTimeStr: string) => {
        const [time, date] = dateTimeStr.split("::");
        const nextTime = parseInt(time) + 30;
        if (parseInt(time) + 30 >= 24 * 60) {
            // it's the next day, ALWAYS render the stop.
            return false;
        }
        const nextDateTimeStr = `${nextTime}::${date}`;
        const stat = meetup.selectionMap[nextDateTimeStr]
            ? meetup.selectionMap[nextDateTimeStr].length > 0
            : false;
        return stat;
    };

    /**
     * Checks to see if the PREVIOUS timing has the same # of people and the same people in it.
     * If so, we can merge the two time slots together and don't render THIS current time slot.
     *
     * @param dateTimeStr the current time to check the previous date of
     * @returns true if the previous time slot has the same people and the same # of people    *
     *
     */
    const isPreviousTimeSlotSame = (dateTimeStr: string) => {
        const [time, date] = dateTimeStr.split("::");
        const prevTime = parseInt(time) - 30;
        if (parseInt(time) < 0) {
            // it's the previous day
            return false;
        }

        const prevDateTimeStr = `${prevTime}::${date}`;
        const curSelected = meetup.selectionMap[dateTimeStr];
        const previousSelected = meetup.selectionMap[prevDateTimeStr];
        if (
            !previousSelected ||
            !curSelected ||
            (previousSelected && previousSelected.length != curSelected.length)
        ) {
            return false;
        }

        // check if the two arrays have the same contents
        const temp: { [key: number]: number } = {};
        curSelected.forEach((user) => (temp[user.id] = 1));
        const isSame = previousSelected.every((user) => temp[user.id] === 1);

        return isSame;
    };

    /**
     * Checks to see if the NEXT timing has the same # of people and the same people in it.
     * If so, we can merge the two time slots together and don't render THIS current time slot.
     *
     * @param dateTimeStr the current time to check the previous date of
     * @returns true if the previous time slot has the same people and the same # of people    *
     *
     */
    const isNextTimeSlotSame = (dateTimeStr: string) => {
        const [time, date] = dateTimeStr.split("::");
        const nextTime = parseInt(time) + 30;
        if (parseInt(time) >= 24 * 60) {
            // it's the previous day
            return false;
        }

        const nextDateTimeStr = `${nextTime}::${date}`;
        const curSelected = meetup.selectionMap[dateTimeStr];
        const nextSelected = meetup.selectionMap[nextDateTimeStr];
        if (
            !nextSelected ||
            !curSelected ||
            (nextSelected && nextSelected.length != curSelected.length)
        ) {
            return false;
        }

        // check if the two arrays have the same contents
        const temp: { [key: number]: number } = {};
        curSelected.forEach((user) => (temp[user.id] = 1));
        const isSame = nextSelected.every((user) => temp[user.id] === 1);

        return isSame;
    };

    /**
     * Checks to see how many of the next time slots have the same # of people and the same people in it.
     *
     * Stops counting at midnight.
     *
     * @param dateTimeStr the current date and time to check
     * @returns An array [0, 1, ..., n-1] where n and
     * length is equal to the number of consecutive time slots that have the same # of people and the same people in it.
     */
    const getNumberOfConsectiveSelectedTimeSlots = (dateTimeStr: string) => {
        const [time, date] = dateTimeStr.split("::");
        let nextTime = parseInt(time) + 30;
        let count = 0;
        while (true) {
            if (nextTime >= 24 * 60) {
                // it's the next day, we stop counting here
                break;
            }
            if (isPreviousTimeSlotSame(`${nextTime}::${date}`)) {
                count++;
                nextTime += 30;
            } else {
                break;
            }
        }
        return Array.from(Array(count).keys());
    };

    // preformat: for each day, check if there is at least one person who is available
    const dates = meetup.dates.filter((date) => {
        // return false if there is no one available on that day
        let atLeastOne = false;
        for (let dateTimeStr in meetup.selectionMap) {
            if (dateTimeStr.includes(date)) {
                if (meetup.selectionMap[dateTimeStr].length > 0) {
                    atLeastOne = true;
                    break;
                }
            }
        }
        return atLeastOne;
    });

    return (
        <Grid
            gridTemplateColumns={`72px ${CELL_WIDTH_NUM + FILLER_WIDTH}px 1fr`}
            width="100%"
            gap={0}
        >
            <GridItem
                colSpan={3}
                display="flex"
                justifyContent={"center"}
                alignItems="center"
                mb={3}
            >
                <HStack>
                    <Text> Least </Text>
                    <Flex>
                        {colors.map((color, i) => (
                            <Box
                                key={i}
                                width="24px"
                                height="24px"
                                bgColor={color}
                            />
                        ))}
                    </Flex>
                    <Text> Most </Text>
                </HStack>
            </GridItem>
            {dates.flatMap((date) => [
                <GridItem colSpan={3} key={date} mb={2} display="flex">
                    <Stack width="100%">
                        <Divider borderWidth={"2px"} />
                        <Heading fontSize="lg">
                            {" "}
                            {format(dateParser(date), "EEEE, d MMMM yyyy")}{" "}
                        </Heading>
                    </Stack>
                </GridItem>,
                // TODO: this is old style
                times.flatMap((minute, i) => [
                    ...(meetup.selectionMap[`${minute}::${date}`] &&
                    meetup.selectionMap[`${minute}::${date}`].length
                        ? [
                              ...(!isPreviousTimeSlotSame(`${minute}::${date}`)
                                  ? [
                                        <GridItem
                                            key={`${minute}::${date}-1`}
                                            display="flex"
                                            mb={2}
                                            alignItems="center"
                                            height={"100%"}
                                        >
                                            <Stack
                                                height="100%"
                                                spacing={0}
                                                justifyContent="center"
                                                alignItems={"center"}
                                                width="100%"
                                            >
                                                <Center>
                                                    {convertMinutesToAmPm(
                                                        minute
                                                    )}
                                                </Center>
                                                <Box
                                                    height="100%"
                                                    width="2px"
                                                    bgColor={lineColor}
                                                ></Box>
                                            </Stack>
                                        </GridItem>,
                                        <GridItem
                                            key={`${minute}::${date}-2`}
                                            display="flex"
                                            height="100%"
                                            // alignItems={"center"}
                                            pb={2}
                                            // flexWrap="wrap"
                                        >
                                            <Stack spacing={0} height="100%">
                                                <Stack
                                                    spacing={1}
                                                    flexDir="column"
                                                >
                                                    <Flex>
                                                        <DisplayBox
                                                            bgColor={assignColor(
                                                                numberOfUsers,
                                                                meetup
                                                                    .selectionMap[
                                                                    `${minute}::${date}`
                                                                ]
                                                                    ? meetup
                                                                          .selectionMap[
                                                                          `${minute}::${date}`
                                                                      ].length
                                                                    : 0
                                                            )}
                                                            height={
                                                                CELL_HEIGHT_NUM *
                                                                (getNumberOfConsectiveSelectedTimeSlots(
                                                                    `${minute}::${date}`
                                                                ).length +
                                                                    1)
                                                            }
                                                        >
                                                            {Math.round(
                                                                ((meetup
                                                                    .selectionMap[
                                                                    `${minute}::${date}`
                                                                ]
                                                                    ? meetup
                                                                          .selectionMap[
                                                                          `${minute}::${date}`
                                                                      ].length
                                                                    : 0) /
                                                                    numberOfUsers) *
                                                                    100
                                                            )}
                                                            %
                                                        </DisplayBox>

                                                        <Box
                                                            w={`${FILLER_WIDTH}px`}
                                                            bgColor={bgColor}
                                                            height={`${
                                                                CELL_HEIGHT_NUM *
                                                                (getNumberOfConsectiveSelectedTimeSlots(
                                                                    `${minute}::${date}`
                                                                ).length +
                                                                    1)
                                                            }px`}
                                                        ></Box>
                                                    </Flex>
                                                    {/* {getNumberOfConsectiveSelectedTimeSlots(
                                                        `${minute}::${date}`
                                                    ).map((num) => (
                                                        <Flex>
                                                            <DisplayBox
                                                                key={num}
                                                                bgColor={assignColor(
                                                                    numberOfUsers,
                                                                    meetup
                                                                        .selectionMap[
                                                                        `${minute}::${date}`
                                                                    ]
                                                                        ? meetup
                                                                              .selectionMap[
                                                                              `${minute}::${date}`
                                                                          ]
                                                                              .length
                                                                        : 0
                                                                )}

                                                            >
                                                                </DisplayBox>

                                                            <Box
                                                                w={`${FILLER_WIDTH}px`}
                                                                bgColor={
                                                                    bgColor
                                                                }
                                                                height={
                                                                    CELL_HEIGHT
                                                                }
                                                            ></Box>
                                                        </Flex>
                                                    ))} */}
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
                                                        bgColor={
                                                            pageBackgroundColor
                                                        }
                                                        position="absolute"
                                                        borderRadius="0 4px 0 0"
                                                    ></Box>
                                                </Box>
                                            </Stack>
                                        </GridItem>,
                                        <GridItem
                                            key={`${minute}::${date}-3`}
                                            //   display="unset"

                                            bgColor={bgColor}
                                            mb={2} // TODO: change mb to pb if combining
                                            // TODO: see the lower one, #styling
                                            borderRadius="0 4px 4px 0"
                                        >
                                            <SimpleGrid
                                                columns={2}
                                                spacing={3}
                                                p={3}
                                            >
                                                {meetup.selectionMap[
                                                    `${minute}::${date}`
                                                ] &&
                                                    meetup.selectionMap[
                                                        `${minute}::${date}`
                                                    ].map((user, i) => (
                                                        <Box key={i}>
                                                            <Flex alignItems="center">
                                                                <Avatar
                                                                    name={`${user.first_name} ${user.last_name}`}
                                                                    src={
                                                                        user.photo_url
                                                                    }
                                                                    size="xs"
                                                                />
                                                                <Text ml={2}>
                                                                    {
                                                                        user.first_name
                                                                    }
                                                                </Text>
                                                            </Flex>
                                                        </Box>
                                                    ))}
                                            </SimpleGrid>
                                        </GridItem>,
                                    ]
                                  : []),
                              ...(!checkIfNextTimeSlotHasPeople(
                                  `${minute}::${date}`
                              )
                                  ? [
                                        <GridItem
                                            key={`${minute}::${date}-4`}
                                            display="flex"
                                            mb={2}
                                            alignItems="center"
                                            height={"100%"}
                                        >
                                            <Stack
                                                height="100%"
                                                spacing={0}
                                                justifyContent="center"
                                                alignItems={"center"}
                                                width="100%"
                                            >
                                                <Center>
                                                    {convertMinutesToAmPm(
                                                        minute + 30
                                                    )}
                                                </Center>
                                                <Box
                                                    height="100%"
                                                    width="2px"
                                                    bgColor={lineColor}
                                                ></Box>
                                            </Stack>
                                        </GridItem>,
                                        <GridItem
                                            key={`${minute}::${date}-5`}
                                            pb={2}
                                        ></GridItem>,
                                        <GridItem
                                            key={`${minute}::${date}-6`}
                                            pb={2}
                                        ></GridItem>,
                                    ]
                                  : []),
                          ]
                        : []),
                ]),

                // times.flatMap((minute, i) => [
                //     ...(meetup.selectionMap[`${minute}::${date}`] &&
                //     meetup.selectionMap[`${minute}::${date}`].length
                //         ? [
                //               <GridItem
                //                   key={`${minute}::${date}-1`}
                //                   display="flex"
                //                   mb={2}
                //                   alignItems="center"
                //                   height={"100%"}
                //               >
                //                   <Stack
                //                       height="100%"
                //                       spacing={0}
                //                       justifyContent="center"
                //                       alignItems={"center"}
                //                       width="100%"
                //                   >
                //                       <Center>
                //                           {convertMinutesToAmPm(minute)}
                //                       </Center>
                //                       <Box
                //                           height="100%"
                //                           width="2px"
                //                           bgColor={lineColor}
                //                       ></Box>
                //                   </Stack>
                //               </GridItem>,
                //               <GridItem
                //                   key={`${minute}::${date}-2`}
                //                   display="flex"
                //                   height="100%"
                //                   // alignItems={"center"}
                //                   pb={2}
                //                   // flexWrap="wrap"
                //               >
                //                   <Stack spacing={0} height="100%">
                //                       <Stack spacing={1} flexDir="column">
                //                           <Flex>
                //                               <DisplayBox
                //                                   bgColor={assignColor(
                //                                       numberOfUsers,
                //                                       meetup.selectionMap[
                //                                           `${minute}::${date}`
                //                                       ]
                //                                           ? meetup.selectionMap[
                //                                                 `${minute}::${date}`
                //                                             ].length
                //                                           : 0
                //                                   )}
                //                               >
                //                                   {Math.round(
                //                                       ((meetup.selectionMap[
                //                                           `${minute}::${date}`
                //                                       ]
                //                                           ? meetup.selectionMap[
                //                                                 `${minute}::${date}`
                //                                             ].length
                //                                           : 0) /
                //                                           numberOfUsers) *
                //                                           100
                //                                   )}
                //                                   %
                //                               </DisplayBox>

                //                               <Box
                //                                   w={`${FILLER_WIDTH}px`}
                //                                   bgColor={bgColor}
                //                                   height={CELL_HEIGHT}
                //                               ></Box>
                //                           </Flex>
                //                           {/* {getNumberOfConsectiveSelectedTimeSlots(
                //                                         `${minute}::${date}`
                //                                     ).map((num) => (
                //                                         <Flex>
                //                                             <DisplayBox
                //                                                 key={num}
                //                                                 bgColor={assignColor(
                //                                                     numberOfUsers,
                //                                                     meetup
                //                                                         .selectionMap[
                //                                                         `${minute}::${date}`
                //                                                     ]
                //                                                         ? meetup
                //                                                               .selectionMap[
                //                                                               `${minute}::${date}`
                //                                                           ]
                //                                                               .length
                //                                                         : 0
                //                                                 )}

                //                                             >
                //                                                 </DisplayBox>

                //                                             <Box
                //                                                 w={`${FILLER_WIDTH}px`}
                //                                                 bgColor={
                //                                                     bgColor
                //                                                 }
                //                                                 height={
                //                                                     CELL_HEIGHT
                //                                                 }
                //                                             ></Box>
                //                                         </Flex>
                //                                     ))} */}
                //                       </Stack>
                //                       <Box
                //                           w="100%"
                //                           height="45%"
                //                           bgColor={bgColor}
                //                           position="relative"
                //                       >
                //                           <Box
                //                               w="100%"
                //                               height="100%"
                //                               bgColor={pageBackgroundColor}
                //                               position="absolute"
                //                               borderRadius="0 4px 0 0"
                //                           ></Box>
                //                       </Box>
                //                   </Stack>
                //               </GridItem>,
                //               <GridItem
                //                   key={`${minute}::${date}-3`}
                //                   //   display="unset"

                //                   bgColor={bgColor}
                //                   mb={
                //                     isNextTimeSlotSame(
                //                           `${minute}::${date}`
                //                       )
                //                           ? 0
                //                           : 2
                //                   } // TODO: change mb to pb if combining
                //                   pb={
                //                     isNextTimeSlotSame(
                //                           `${minute}::${date}`
                //                       )
                //                           ? 2
                //                           : 2
                //                   } // TODO: change mb to pb if combining
                //                   // TODO: see the lower one, #styling
                //                   borderRadius="0 4px 4px 0"
                //               >
                //                   {!isPreviousTimeSlotSame(`${minute}::${date}`) && <SimpleGrid columns={2} spacing={3} p={3}>
                //                       {meetup.selectionMap[
                //                           `${minute}::${date}`
                //                       ] &&
                //                           meetup.selectionMap[
                //                               `${minute}::${date}`
                //                           ].map((user, i) => (
                //                               <Box key={i}>
                //                                   <Flex alignItems="center">
                //                                       <Avatar
                //                                           name={`${user.first_name} ${user.last_name}`}
                //                                           src={user.photo_url}
                //                                           size="xs"
                //                                       />
                //                                       <Text ml={2}>
                //                                           {user.first_name}
                //                                       </Text>
                //                                   </Flex>
                //                               </Box>
                //                           ))}
                //                   </SimpleGrid>}
                //               </GridItem>,

                //               ...(!checkIfNextTimeSlotHasPeople(
                //                   `${minute}::${date}`
                //               )
                //                   ? [
                //                         <GridItem
                //                             key={`${minute}::${date}-4`}
                //                             display="flex"
                //                             mb={2}
                //                             alignItems="center"
                //                             height={"100%"}
                //                         >
                //                             <Stack
                //                                 height="100%"
                //                                 spacing={0}
                //                                 justifyContent="center"
                //                                 alignItems={"center"}
                //                                 width="100%"
                //                             >
                //                                 <Center>
                //                                     {convertMinutesToAmPm(
                //                                         minute + 30
                //                                     )}
                //                                 </Center>
                //                                 <Box
                //                                     height="100%"
                //                                     width="2px"
                //                                     bgColor={lineColor}
                //                                 ></Box>
                //                             </Stack>
                //                         </GridItem>,
                //                         <GridItem
                //                             key={`${minute}::${date}-5`}
                //                             pb={2}
                //                         ></GridItem>,
                //                         <GridItem
                //                             key={`${minute}::${date}-6`}
                //                             pb={2}
                //                         ></GridItem>,
                //                     ]
                //                   : []),
                //           ]
                //         : []),
                // ]),
            ])}
        </Grid>
    );
};

const CELL_WIDTH = "36px";
const CELL_WIDTH_NUM = 36;
const FILLER_WIDTH = 6;
const CELL_HEIGHT = "24px";
const CELL_HEIGHT_NUM = 24;

/**
 * Computes the box component for a 30-minute time slot.
 *
 * @returns A box component representing a 30-minute time slot
 */
const DisplayBox = ({
    children,
    bgColor,
    height,
}: {
    children?: React.ReactNode;
    bgColor: string;
    height?: number;
}) => {
    return (
        <Center
            width={`${CELL_WIDTH_NUM}px`}
            // height={`${height}px}`}
            height={`${height}px`}
            bgColor={bgColor}
            // outline="1px dashed"
            // outlineColor={cellOutlineColor}
            borderRadius={"4px 0 0 4px"}
        >
            <Text fontSize="2xs"> {children}</Text>
        </Center>
    );
};

export default ByTimeList;
