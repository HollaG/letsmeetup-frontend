import { Button, ButtonProps } from "@chakra-ui/react";
import React, { useState } from "react";

const FancyButton = ({
    children,
    props,
}: {
    children: React.ReactNode | React.ReactNode[];
    props?: ButtonProps;
}) => {
    // on hover, min background pos: 50, max background pos: 100
    const [x, setX] = useState<number>(150);
    const onMouseMove = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setX(e.nativeEvent.offsetX > 300 ? 300 : e.nativeEvent.offsetX);
    };

    const xpercent = ((x / 300) * 100) / 2 + 50;

    return (
        <Button
            onMouseMove={onMouseMove}
            rounded={"full"}
            _hover={{
                // marginLeft: "65px",

                backgroundPosition: !props?.isDisabled
                    ? `${xpercent}% 0px`
                    : "unset",
            }}
            size="lg"
            sx={{
                // height: "40px",
                // width: "120px",
                color: "rgb(255, 255, 255)",
                backgroundSize: "300% 100%",
                background:
                    "linear-gradient(90deg, rgba(255,87,87,1) 0%, rgba(140,82,255,1) 100%)",
                boxShadow: "rgb(140, 82, 255, 0.65) 0 4px 15px 0px",
                transition:
                    "all 0.3s ease-in-out 0s, background 0.05s ease-in-out 0s, transform 0.1s ease-out 0s",
            }}
            _focus={{
                boxShadow: !props?.isDisabled
                    ? "rgb(140, 82, 255, 1) 0 4px 15px 0px"
                    : "unset",
            }}
            _active={{
                // background: "rgba(140,82,255,1)",
                transform: !props?.isDisabled ? "scale(0.98)" : "unset",
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default React.memo(FancyButton);
