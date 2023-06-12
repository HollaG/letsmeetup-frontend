import { IconButton, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useTelegram } from "../../context/TelegramProvider";

export const GoLeftButton = React.memo(
    ({ canGoLeft, goLeft }: { canGoLeft: boolean; goLeft: () => void }) => {
        const { style } = useTelegram();
        const _btnColor = useColorModeValue("#D6BCFA", "#553C9A");
        const _disabledBtnColor = useColorModeValue("#EDF2F7", "#1A202C");

        const btnColor = style?.button_color || _btnColor;

        return (
            <IconButton
                size="xs"
                isDisabled={!canGoLeft}
                onClick={goLeft}
                aria-label="Previous month"
                icon={<FaChevronLeft />}
                // colorScheme="gray"
                color={btnColor}
            />
        );
    }
);

export const GoRightButton = React.memo(
    ({ canGoRight, goRight }: { canGoRight: boolean; goRight: () => void }) => {
        const { style } = useTelegram();
        const _btnColor = useColorModeValue("#D6BCFA", "#553C9A");

        const btnColor = style?.button_color || _btnColor;

        return (
            <IconButton
                size="xs"
                isDisabled={!canGoRight}
                onClick={goRight}
                aria-label="Next month"
                icon={<FaChevronRight />}
                color={btnColor}
            />
        );
    }
);
