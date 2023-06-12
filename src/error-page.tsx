import {
    Box,
    Button,
    Center,
    Heading,
    Image,
    Stack,
    Text,
} from "@chakra-ui/react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError() as any;
    console.error(error);

    return (
        <Center mt={16}>
            <Stack w="100%">
                <Image
                    src="images/notfound.svg"
                    maxW={"400px"}
                    w="100%"
                    mx={"auto"}
                />
                <Heading
                    fontSize={"8xl"}
                    fontFamily="Zilla Slab"
                    textAlign="center"
                >
                    {" "}
                    {isRouteErrorResponse(error) ? error.status : "404"}
                </Heading>
                <Center>
                    <Text textAlign={"center"} fontSize="lg" maxW={"600px"}>
                        {isRouteErrorResponse(error) && error.statusText
                            ? error.status === 404
                                ? "Oops, there's nothing at this location!"
                                : error.statusText
                            : error.message
                            ? error.message
                            : "An unexpected error occured. That's all we know 😅. Perhaps try again later?"}
                    </Text>
                </Center>
                <Center>
                    <Button
                        as={Link}
                        to="/"
                        variant="ghost"
                        fontFamily="Zilla Slab"
                        size="lg"
                    >
                        ⟵ Back to home
                    </Button>
                </Center>
            </Stack>
        </Center>
    );
}
