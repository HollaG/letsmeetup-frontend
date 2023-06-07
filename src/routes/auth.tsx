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
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Spacer,
    FormErrorMessage,
    FormHelperText,
    useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import GoogleButton from "react-google-button";
import { Navigate, redirect } from "react-router-dom";
import HelperText from "../components/Display/HelperText";
import { useWebUser } from "../context/WebAuthProvider";
import { signInWithoutUsername } from "../firebase/auth/anonymous";
import { createAccountEmail, signInEmail } from "../firebase/auth/email";
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

export function LoginCard() {
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
                        to edit your meetups in future ✌️
                        {/* <Link color={"blue.400"}>features</Link>  */}
                    </Text>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white", "gray.700")}
                    boxShadow={"lg"}
                    p={8}
                >
                    {<LoginInfo />}
                </Box>
            </Stack>
        </Flex>
    );
}

export function LoginInfo() {
    // sign in
    const [returningEmail, setReturningEmail] = useState("");
    const [returningPassword, setReturningPassword] = useState("");

    const returningEmailIsValid = returningEmail.includes("@");
    const returningPasswordIsValid = returningPassword.trim().length >= 6;

    const [returningEmailIncorrect, setReturningEmailIncorrect] =
        useState(false);
    const [returningPasswordIncorrect, setReturningPasswordIncorrect] =
        useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");

    const emailIsValid = newEmail.includes("@");
    const passwordIsValid = newPassword.trim().length >= 6;
    const confirmSameAsNew = newConfirmPassword === newPassword;
    const newFirstNameValid = newFirstName.trim().length;

    const canCreate =
        emailIsValid &&
        passwordIsValid &&
        confirmSameAsNew &&
        newFirstNameValid;

    const toast = useToast();
    const onCreateAccount = async () => {
        // simple email validation
        if (!canCreate) {
            return;
        }

        try {
            const acct = await createAccountEmail(
                newEmail,
                newPassword,
                newFirstName,
                newLastName
            );
            toast({
                title: "Account created.",
                description:
                    "You have been signed in! You can now create your meetup.",
                status: "success",
            });
        } catch (e: any) {
            if (e.toString().includes("invalid-email")) {
                toast({
                    title: "Error creating account!",
                    description:
                        "The provided email is invalid. Please provide a valid email address.",
                    status: "error",
                    duration: 9000,
                });
            } else if (e.toString().includes("email-already-in-use")) {
                toast({
                    title: "Error creating account!",
                    description:
                        "This email already exists. Please sign in instead.",
                    status: "error",
                    duration: 9000,
                });
            } else
                toast({
                    title: "Unexpected error",
                    description: e.toString(),
                    status: "error",
                    duration: 9000,
                });
        }
    };

    const signIn = async () => {
        try {
            await signInEmail(returningEmail, returningPassword);
        } catch (e: any) {
            console.log({ e });
            if (
                e.toString().includes("invalid-email") ||
                e.toString().includes("user-not-found")
            ) {
                setReturningEmailIncorrect(true);
            } else if (
                e.toString().includes("wrong-password") ||
                e.toString().includes("invalid-password")
            ) {
                setReturningPasswordIncorrect(true);
            } else {
                toast({
                    title: "Unexpected error",
                    description: e.toString(),
                    status: "error",
                    duration: 9000,
                });
            }
        }
    };

    return (
        <Tabs variant="soft-rounded" isFitted>
            <TabList>
                <Tab>Returning User</Tab>
                <Tab>New User</Tab>
            </TabList>

            <TabPanels>
                <TabPanel>
                    <Stack spacing={4}>
                        <FormControl
                            id="email"
                            isRequired
                            isInvalid={returningEmailIncorrect}
                        >
                            <FormLabel>Email</FormLabel>
                            <Input
                                value={returningEmail}
                                onChange={(e) => {
                                    setReturningEmail(e.target.value);
                                    setReturningEmailIncorrect(false);
                                }}
                                type="email"
                            />
                            {!returningEmailIncorrect ? (
                                <FormHelperText>
                                    Please enter the email you signed up with.
                                </FormHelperText>
                            ) : (
                                <FormErrorMessage>
                                    Email does not exist, please sign up first!
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            id="password"
                            isRequired
                            isInvalid={returningPasswordIncorrect}
                        >
                            <FormLabel>Password</FormLabel>
                            <Input
                                value={returningPassword}
                                onChange={(e) => {
                                    setReturningPassword(e.target.value);
                                    setReturningPasswordIncorrect(false);
                                }}
                                type="password"
                            />
                            {!returningPasswordIncorrect ? (
                                <FormHelperText>
                                    Your password must be at least 6 characters
                                    long.
                                </FormHelperText>
                            ) : (
                                <FormErrorMessage>
                                    Your password is incorrect!
                                </FormErrorMessage>
                            )}
                        </FormControl>

                        <Stack>
                            <Button colorScheme={"blue"} onClick={signIn}>
                                Sign in
                            </Button>
                        </Stack>

                        <Divider />
                        <Center>
                            <GoogleButton onClick={signInWithGoogle} />
                        </Center>
                    </Stack>
                </TabPanel>
                <TabPanel>
                    <Stack spacing={4}>
                        <FormControl
                            id="new-email"
                            isRequired
                            isInvalid={!(newEmail === "" || emailIsValid)}
                        >
                            <FormLabel>Email</FormLabel>
                            <Input
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                type="email"
                            />
                            {newEmail === "" || emailIsValid ? (
                                <FormHelperText>
                                    Your email will be used to sign in in
                                    future.
                                </FormHelperText>
                            ) : (
                                <FormErrorMessage>
                                    Email is invalid!
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            id="new-password"
                            isRequired
                            isInvalid={!(newPassword === "" || passwordIsValid)}
                        >
                            <FormLabel>Password</FormLabel>
                            <Input
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                type="password"
                            />
                            {newPassword === "" || passwordIsValid ? (
                                <FormHelperText>
                                    Your password must be at least 6 characters
                                    long.
                                </FormHelperText>
                            ) : (
                                <FormErrorMessage>
                                    Password does not meet requirements!
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            id="new-confirm-password"
                            isRequired
                            isInvalid={
                                !(newConfirmPassword === "" || confirmSameAsNew)
                            }
                        >
                            <FormLabel>Confirm Password</FormLabel>
                            <Input
                                value={newConfirmPassword}
                                onChange={(e) =>
                                    setNewConfirmPassword(e.target.value)
                                }
                                type="password"
                            />
                            {newConfirmPassword === "" || confirmSameAsNew ? (
                                <FormHelperText>
                                    Please re-type your password.
                                </FormHelperText>
                            ) : (
                                <FormErrorMessage>
                                    Passwords do not match!
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <Flex flexDir={"row"}>
                            <FormControl
                                mr={1}
                                id="new-firstname"
                                isRequired
                                isInvalid={newFirstName.trim() === ""}
                            >
                                <FormLabel>First Name</FormLabel>
                                <Input
                                    value={newFirstName}
                                    onChange={(e) =>
                                        setNewFirstName(e.target.value)
                                    }
                                    type="text"
                                />
                                {/* <HelperText></HelperText> */}
                            </FormControl>
                            <FormControl ml={1} id="new-lastname">
                                <FormLabel>Last Name</FormLabel>
                                <Input
                                    value={newLastName}
                                    onChange={(e) =>
                                        setNewLastName(e.target.value)
                                    }
                                    type="text"
                                    placeholder="Optional"
                                />
                                {/* <HelperText></HelperText> */}
                            </FormControl>{" "}
                        </Flex>
                        <Stack spacing={10}>
                            <Button
                                colorScheme={"blue"}
                                onClick={onCreateAccount}
                                isDisabled={!canCreate}
                            >
                                Sign up
                            </Button>
                        </Stack>
                        <Divider />
                        <Center>
                            <GoogleButton
                                label="Sign up with Google"
                                onClick={signInWithGoogle}
                            />
                        </Center>
                    </Stack>
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}

export default AuthPage;
