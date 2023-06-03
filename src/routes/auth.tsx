import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Link,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Divider,
    Center,
} from "@chakra-ui/react";
import GoogleButton from "react-google-button";

const AuthPage = () => {
    return (
        <Stack>
            <LoginCard />
        </Stack>
    );
};

function LoginCard() {
    return (
        <Flex
            // minH={"100vh"}
            align={"center"}
            justify={"center"}
            // bg={useColorModeValue("gray.50", "gray.800")}
        >
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"}>Sign in to your account</Heading>
                    <Text fontSize={"lg"} color={"gray.600"}>
                        to enjoy all of our cool{" "}
                        <Link color={"blue.400"}>features</Link> ✌️
                    </Text>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white", "gray.700")}
                    boxShadow={"lg"}
                    p={8}
                >
                    <Stack spacing={4}>
                        <FormControl id="email">
                            <FormLabel>Email address</FormLabel>
                            <Input type="email" />
                        </FormControl>
                        <FormControl id="password">
                            <FormLabel>Password</FormLabel>
                            <Input type="password" />
                        </FormControl>
                        <Stack spacing={10}>
                            <Stack
                                direction={{ base: "column", sm: "row" }}
                                align={"start"}
                                justify={"space-between"}
                            >
                                <Checkbox>Remember me</Checkbox>
                                <Link
                                    color={useColorModeValue(
                                        "blue.400",
                                        "blue.300"
                                    )}
                                >
                                    Forgot password?
                                </Link>
                            </Stack>
                            <Stack>
                                <Button colorScheme={"blue"}>Sign in</Button>
                                <Button variant="outline">Sign up</Button>
                            </Stack>
                        </Stack>
                        <Divider />
                        <Center>
                            <GoogleButton
                                onClick={() => {
                                    console.log("Google button clicked");
                                }}
                            />
                        </Center>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}

export default AuthPage;
