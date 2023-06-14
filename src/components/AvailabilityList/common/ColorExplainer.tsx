import { useColorModeValue, HStack, Flex, Box, Text } from "@chakra-ui/react";
import React from "react";
import { RANGE_EMPTY_LIGHT, RANGE_EMPTY_DARK } from "../../../lib/std";
import { aC } from "../../../utils/availabilityList.utils";

const ColorExplainer = ({
    numTotal,
    setShowAbovePeople,
    showAbovePeople,
}: {
    numTotal: number;
    setShowAbovePeople: (num: number) => void;
    showAbovePeople: number;
}) => {
    const range_empty = useColorModeValue(RANGE_EMPTY_LIGHT, RANGE_EMPTY_DARK);

    const fullColor = "#38A169";
    const emptyColor = range_empty;

    // possible values: from 1 to numTotal (0 is never shown)
    // naive implementation
    const possibleColors = new Set<string>();
    for (let i = 1; i < numTotal + 1; i++) {
        const color = aC(numTotal, i, fullColor, emptyColor);
        possibleColors.add(color);
    }

    return (
        <HStack>
            <Text> Least </Text>
            <Flex>
                {[...possibleColors].map((color, i) => (
                    <Box
                        key={i}
                        onClick={() =>
                            setShowAbovePeople(
                                Math.round(
                                    ((i + 1) / possibleColors.size) * numTotal
                                )
                            )
                        }
                        width="24px"
                        height="24px"
                        bgColor={color}
                        cursor="pointer"
                        border={
                            showAbovePeople ===
                            Math.round(
                                ((i + 1) / possibleColors.size) * numTotal
                            )
                                ? "1px solid purple.500"
                                : ""
                        }
                        mx={
                            showAbovePeople ===
                            Math.round(
                                ((i + 1) / possibleColors.size) * numTotal
                            )
                                ? 2
                                : 0
                        }
                        ml={
                            showAbovePeople ===
                                Math.round(
                                    ((i + 1) / possibleColors.size) * numTotal
                                ) && i === 0
                                ? 0
                                : showAbovePeople ===
                                  Math.round(
                                      ((i + 1) / possibleColors.size) * numTotal
                                  )
                                ? 2
                                : 0
                        }
                        mr={
                            showAbovePeople ===
                                Math.round(
                                    ((i + 1) / possibleColors.size) * numTotal
                                ) && i === possibleColors.size - 1
                                ? 0
                                : showAbovePeople ===
                                  Math.round(
                                      ((i + 1) / possibleColors.size) * numTotal
                                  )
                                ? 2
                                : 0
                        }
                        transition="all 0.2s ease-in-out"
                    />
                ))}
            </Flex>
            <Text> Most </Text>
        </HStack>
    );
};

export default React.memo(ColorExplainer);
