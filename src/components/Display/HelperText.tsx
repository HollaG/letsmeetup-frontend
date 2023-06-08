import { Text, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useTelegram } from "../../context/TelegramProvider";

/**
 * Renders a helper text.
 *
 * @param param0 the text to display
 * @returns
 */
const HelperText = ({ children }: { children: ReactNode | ReactNode[] }) => {
    const _color = useColorModeValue("gray.700", "gray.300");
    const { style } = useTelegram();

    const color = style?.hint_color || _color;
    return (
        <Text fontSize="xs" color={color} fontWeight="light">
            {children}
        </Text>
    );
};

export default HelperText;
