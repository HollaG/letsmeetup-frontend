import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";

const FancyButton = ({
    children,
    props,
}: {
    children: React.ReactNode | React.ReactNode[];
    props?: ButtonProps;
}) => {
    return (
        <Button
            rounded={"full"}
            _hover={{
                // marginLeft: "65px",

                backgroundPosition: !props?.isDisabled ? "100% 0px" : "unset",
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
                    "all 0.3s ease-in-out 0s, background 0.3s ease-in-out 0s, transform 0.1s ease-out 0s",
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

export default FancyButton;
