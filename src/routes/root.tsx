import { Heading, Text } from "@chakra-ui/react";

const Root = () => {
    return (
        <>
            <Heading> This is my home page it has nothing atm </Heading>
            <Text> your url : {document.location.href}</Text>
        </>
    );
};

export default Root;
