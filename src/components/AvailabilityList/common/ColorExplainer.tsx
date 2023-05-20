import { useColorModeValue, HStack, Flex, Box, Text } from "@chakra-ui/react";
import React from "react";
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
} from "../../../lib/std";
import { assignColor, RangeColors } from "../../../utils/availabilityList.utils";

const ColorExplainer = ({ numTotal }: { numTotal: number }) => {
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

    // possible values: from 1 to numTotal (0 is never shown)
    // naive implementation
    const possibleColors = new Set<string>();
    for (let i = 1; i < numTotal + 1; i++) {
        const color = assignColor(numTotal, i, colors);
        possibleColors.add(color);
    }

    return (
        <HStack>
            <Text> Least </Text>
            <Flex>
                {[...possibleColors].map((color, i) => (
                    <Box key={i} width="24px" height="24px" bgColor={color} />
                ))}
            </Flex>
            <Text> Most </Text>
        </HStack>
    );
};

export default React.memo(ColorExplainer);
