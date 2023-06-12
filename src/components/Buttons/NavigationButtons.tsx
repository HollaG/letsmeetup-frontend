import { IconButton } from "@chakra-ui/react";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export const GoLeftButton = React.memo(
    ({ canGoLeft, goLeft }: { canGoLeft: boolean; goLeft: () => void }) => {
        return (
            <IconButton
                size="xs"
                isDisabled={!canGoLeft}
                onClick={goLeft}
                aria-label="Previous month"
                icon={<FaChevronLeft />}
                colorScheme="gray"
            />
        );
    }
);

export const GoRightButton = React.memo(
    ({ canGoRight, goRight }: { canGoRight: boolean; goRight: () => void }) => {
        return (
            <IconButton
                size="xs"
                isDisabled={!canGoRight}
                onClick={goRight}
                aria-label="Next month"
                icon={<FaChevronRight />}
                colorScheme="gray"
            />
        );
    }
);
