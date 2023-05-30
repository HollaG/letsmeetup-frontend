import { Center, Text } from "@chakra-ui/react";
import React from "react";

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
    height = CELL_HEIGHT_NUM,
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
            <Text fontSize="2xs" textAlign="center">
                {" "}
                {children}
            </Text>
        </Center>
    );
};

export default React.memo(DisplayBox);
