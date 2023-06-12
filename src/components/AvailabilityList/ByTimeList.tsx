import {
    Avatar,
    Box,
    Center,
    Divider,
    Flex,
    Grid,
    GridItem,
    Heading,
    Link,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { format } from "date-fns";
import React from "react";
import { useTelegram } from "../../context/TelegramProvider";
import { Meetup } from "../../firebase/db/repositories/meetups";
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
import { ITelegramUser } from "../../types/telegram";
import {
    hasPeopleInNextTimeSlot,
    isSameAsPreviousTimeSlot,
    RangeColors,
    getSlotLength,
    aC,
} from "../../utils/availabilityList.utils";
import { dateParser } from "../Calendar/CalendarContainer";
import { convertMinutesToAmPm } from "../Time/TimeSelector";
import CommentsDisplay from "./common/CommentsDisplay";
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

    const times = [...new Set(meetup.timeslots.map(removeDate))].sort(
        (a, b) => a - b
    );

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

    const lineColor = useColorModeValue("blackAlpha.600", "whiteAlpha.600");

    const fullColor = "#38A169";
    const emptyColor = range_empty;

    const { style } = useTelegram();
    const _dataBgColor = useColorModeValue("gray.100", "gray.900");
    const _pageBackgroundColor = useColorModeValue("white", "gray.800");

    const dataBgColor = style?.secondary_bg_color || _dataBgColor;
    const pageBackgroundColor = style?.bg_color || _pageBackgroundColor;

    const _durationBgColor = useColorModeValue("gray.200", "gray.700");
    const durationTextColor = useColorModeValue("gray.600", "gray.300");

    const durationBgColor = style?.hint_color || _durationBgColor;

    // preformat: for each day, check if there is at least one person who is available
    const dates = meetup.dates.filter((date) => {
        // return false if there is no one available on that day
        let atLeastOne = false;
        for (const dateTimeStr in meetup.selectionMap) {
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
            {dates.flatMap((date) => [
                <GridItem colSpan={3} key={date} mb={2} display="flex">
                    <Stack width="100%">
                        <Divider borderWidth={"2px"} />
                        <Heading fontSize="md" id={date}>
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
                                                <Center fontSize={"sm"}>
                                                    {convertMinutesToAmPm(
                                                        minute
                                                    )}
                                                </Center>
                                                <Box
                                                    height="100%"
                                                    width="2px"
                                                    bgColor={lineColor}
                                                    borderRadius="1px"
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
                                                            bgColor={aC(
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
                                                                fullColor,
                                                                emptyColor
                                                            )}
                                                            // height={Math.min(
                                                            //     24 * 2,
                                                            //     CELL_HEIGHT_NUM *
                                                            //         (getNumberOfConsectiveSelectedTimeSlots(
                                                            //             `${minute}::${date}`,
                                                            //             meetup
                                                            //         ).length +
                                                            //             1)
                                                            // )}
                                                            height={48}
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
                                                            %<br />
                                                            <sup>
                                                                {meetup
                                                                    .selectionMap[
                                                                    `${minute}::${date}`
                                                                ]
                                                                    ? meetup
                                                                          .selectionMap[
                                                                          `${minute}::${date}`
                                                                      ].length
                                                                    : 0}
                                                            </sup>
                                                            /
                                                            <sub>
                                                                {numberOfUsers}
                                                            </sub>
                                                        </DisplayBox>

                                                        <Box
                                                            w={`${FILLER_WIDTH}px`}
                                                            bgColor={
                                                                dataBgColor
                                                            }
                                                            // height={`${Math.min(
                                                            //     24 * 2,
                                                            //     CELL_HEIGHT_NUM *
                                                            //         (getNumberOfConsectiveSelectedTimeSlots(
                                                            //             `${minute}::${date}`,
                                                            //             meetup
                                                            //         ).length +
                                                            //             1)
                                                            // )}px`}
                                                            height="48px"
                                                        ></Box>
                                                    </Flex>
                                                </Stack>
                                                <Box
                                                    w="100%"
                                                    height="45%"
                                                    bgColor={dataBgColor}
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

                                            bgColor={dataBgColor}
                                            mb={4} // TODO: change mb to pb if combining
                                            // TODO: see the lower one, #styling
                                            borderRadius="0 4px 4px 0"
                                            position="relative"
                                        >
                                            <Box
                                                position="absolute"
                                                right="6px"
                                                top="-12px"
                                                bgColor={durationBgColor}
                                                p={1}
                                                borderRadius="4px"
                                                width="46px" // the max width of the longest word (23 hr 30 min)
                                                textAlign="center"
                                            >
                                                <Text
                                                    fontSize={"2xs"}
                                                    fontWeight="light"
                                                    color={durationTextColor}
                                                >
                                                    {getSlotLength(
                                                        `${minute}::${date}`,
                                                        meetup
                                                    )}
                                                </Text>
                                            </Box>
                                            <SimpleGrid
                                                mt={2}
                                                columns={{
                                                    base: 2,
                                                    sm: 3,
                                                    md: 4,
                                                    lg: 6,
                                                }}
                                                spacing={2}
                                                p={2}
                                            >
                                                {meetup.selectionMap[
                                                    `${minute}::${date}`
                                                ] &&
                                                    meetup.selectionMap[
                                                        `${minute}::${date}`
                                                    ].map((user, i) =>
                                                        user.type ===
                                                        "telegram" ? (
                                                            <Link
                                                                href={`https://t.me/${
                                                                    (
                                                                        user as ITelegramUser
                                                                    ).username
                                                                }`}
                                                                textDecor="none"
                                                                isExternal
                                                                key={i}
                                                                fontSize="sm"
                                                            >
                                                                <Stack
                                                                    alignItems={
                                                                        "center"
                                                                    }
                                                                    justifyContent="center"
                                                                    spacing={1}
                                                                >
                                                                    <Avatar
                                                                        name={`${user.first_name} ${user.last_name}`}
                                                                        src={
                                                                            user.photo_url
                                                                        }
                                                                        size="xs"
                                                                    />
                                                                    <Text
                                                                        textAlign={
                                                                            "center"
                                                                        }
                                                                    >
                                                                        {
                                                                            user.first_name
                                                                        }
                                                                    </Text>
                                                                </Stack>
                                                            </Link>
                                                        ) : (
                                                            <Box key={i}>
                                                                {" "}
                                                                <Stack
                                                                    alignItems={
                                                                        "center"
                                                                    }
                                                                    justifyContent="center"
                                                                    spacing={1}
                                                                >
                                                                    <Avatar
                                                                        name={`${user.first_name} ${user.last_name}`}
                                                                        src={
                                                                            user.photo_url
                                                                        }
                                                                        size="xs"
                                                                    />
                                                                    <Text
                                                                        textAlign={
                                                                            "center"
                                                                        }
                                                                    >
                                                                        {
                                                                            user.first_name
                                                                        }
                                                                    </Text>
                                                                </Stack>
                                                            </Box>
                                                        )
                                                    )}
                                            </SimpleGrid>
                                            <Box

                                            // bgColor="white"
                                            >
                                                <Progress
                                                    colorScheme={"gray"}
                                                    value={Math.round(
                                                        ((meetup.selectionMap[
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
                                                    // size="xs"
                                                    height="3px"
                                                    borderBottomLeftRadius={2}
                                                    borderBottomRightRadius={2}
                                                />
                                            </Box>
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
                                                <Center fontSize={"sm"}>
                                                    {convertMinutesToAmPm(
                                                        minute + 30
                                                    )}
                                                </Center>
                                                <Box
                                                    height="100%"
                                                    width="2px"
                                                    bgColor={lineColor}
                                                    borderRadius="1px"
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
            ])}
            <GridItem colSpan={3} mb={3}>
                <Divider borderWidth={"2px"} mb={3} />
                <CommentsDisplay meetup={meetup} />
            </GridItem>
        </Grid>
    );
};

const CELL_WIDTH = "36px";
const CELL_WIDTH_NUM = 36;
const FILLER_WIDTH = 6;
const CELL_HEIGHT = "24px";
const CELL_HEIGHT_NUM = 24;

export default ByTimeList;
