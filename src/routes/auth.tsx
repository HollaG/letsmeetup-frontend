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
import { useEffect } from "react";
import GoogleButton from "react-google-button";
import { Navigate, redirect } from "react-router-dom";
import HelperText from "../components/Display/HelperText";
import { useWebUser } from "../context/WebAuthProvider";
import { signInWithoutUsername } from "../firebase/auth/anonymous";
import { signInWithGoogle } from "../firebase/auth/google";

const AuthPage = () => {
    const webUser = useWebUser();

    const searchParams = new URLSearchParams(document.location.search);
    useEffect(() => {
        if (webUser) {
            console.log("got web user", searchParams);
            // redirect to wherever they were going
            redirect("/");
        }
    }, [webUser]);

    return webUser ? (
        <Navigate to="/" />
    ) : (
        <Stack>
            <LoginCard />
        </Stack>
    );
};

/**
 * Directly sends the user to the login page
 */
const skipSignIn = () => {};

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
                        <Button onClick={() => signInWithoutUsername()}>
                            {" "}
                            Skip sign in{" "}
                        </Button>

                        <FormControl id="email">
                            <FormLabel>Username</FormLabel>
                            <Input type="email" />
                        </FormControl>
                        <FormControl id="password">
                            <FormLabel>Password (optional)</FormLabel>
                            <Input type="password" />
                            <HelperText>
                                {" "}
                                Set a password so that you can edit your
                                meetups!{" "}
                            </HelperText>
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
                            <GoogleButton onClick={signInWithGoogle} />
                        </Center>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}

export default AuthPage;
