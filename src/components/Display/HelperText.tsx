import { Text, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";

/**
 * Renders a helper text.
 *
 * @param param0 the text to display
 * @returns
 */
const HelperText = ({ children }: { children: ReactNode }) => {
    const color = useColorModeValue("gray.700", "gray.300");
    return (
        <Text fontSize="xs" color={color} fontWeight="light">
            {children}
        </Text>
    );
};

export default HelperText;
