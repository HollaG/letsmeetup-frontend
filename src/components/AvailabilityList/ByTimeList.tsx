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
import {
    RANGE_0_DARK,
    RANGE_0_LIGHT,
    RANGE_1_DARK,
    RANGE_1_LIGHT,
    RANGE_2_DARK,
    RANGE_2_LIGHT,
    RANGE_3_DARK,
    RANGE_3_LIGHT,
    RANGE_4_DARK,
    RANGE_4_LIGHT,
    RANGE_EMPTY_DARK,
    RANGE_EMPTY_LIGHT,
    RANGE_FULL_DARK,
    RANGE_FULL_LIGHT,
} from "../../lib/std";
import { removeDate } from "../../routes/meetup";
import {
    assignColor,
    hasPeopleInNextTimeSlot,
    getNumberOfConsectiveSelectedTimeSlots,
    isSameAsPreviousTimeSlot,
    RangeColors,
} from "../../utils/availabilityList.utils";
import { dateParser } from "../Calendar/CalendarContainer";
import { create30MinuteIncrements } from "../Time/TimeContainer";
import { convertMinutesToAmPm } from "../Time/TimeSelector";
import ColorExplainer from "./common/ColorExplainer";
import DisplayBox from "./common/DisplayBox";

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

    const times = [...new Set(meetup.timeslots.map(removeDate))].sort((a, b) => a - b);

    const startMin = meetup.timeslots.length ? times[0] : 0;
    const endMin = meetup.timeslots.length
        ? times[times.length - 1] + 30 // add 30 because the value gotten is the START of the 30-min slot
        : 24 * 60;



    const numberOfUsers = meetup.users.length;

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
    const lineColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");



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
                <ColorExplainer numTotal={meetup.users.length} />
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
                              ...(!isSameAsPreviousTimeSlot(
                                  `${minute}::${date}`,
                                  meetup
                              )
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
                                                                    : 0,
                                                                colors
                                                            )}
                                                            height={
                                                                CELL_HEIGHT_NUM *
                                                                (getNumberOfConsectiveSelectedTimeSlots(
                                                                    `${minute}::${date}`,
                                                                    meetup
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
                                                                    `${minute}::${date}`,
                                                                    meetup
                                                                ).length +
                                                                    1)
                                                            }px`}
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
                              ...(!hasPeopleInNextTimeSlot(
                                  `${minute}::${date}`,
                                  meetup
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


export default ByTimeList;
