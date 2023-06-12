import {
    Center,
    Divider,
    Heading,
    Image,
    Link as NavLink,
    ListItem,
    Stack,
    Tag,
    Text,
    UnorderedList,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
const AboutPage = () => {
    return (
        <Stack spacing={4}>
            <Center w="100%">
                <Image
                    src="/images/about.png"
                    maxW="600px"
                    borderRadius={"16px"}
                    boxShadow="lg"
                    w="100%"
                />
            </Center>
            <Heading textAlign={"center"} fontFamily="Zilla Slab">
                {" "}
                Look4Times{" "}
            </Heading>
            <Divider />
            <Heading fontSize={"xl"}> General FAQ </Heading>
            <Stack>
                <Heading fontSize={"lg"}> 🤔 What is this? </Heading>
                <Text>
                    {" "}
                    <Tag fontFamily={"Zilla Slab"}>Look4Times</Tag> is a modern
                    web app, designed to help people find free times in their
                    busy schedules to meet up.
                </Text>
            </Stack>
            <Stack>
                <Heading fontSize={"lg"}>
                    {" "}
                    🤔 How is this different from other similar products?{" "}
                </Heading>
                <Text>
                    {" "}
                    The aim when building{" "}
                    <Tag fontFamily={"Zilla Slab"}>Look4Times</Tag> was the user
                    experience. So, I attempted to make it as streamlined as
                    possible, with a user-friendly, frictionless (no signups
                    required) UI.
                </Text>
                <Text>
                    <Tag fontFamily={"Zilla Slab"}>Look4Times</Tag> is also
                    mobile-friendly, supporting dark mode and mobile view.
                </Text>
                <Text>
                    Lastly, <Tag fontFamily={"Zilla Slab"}>Look4Times</Tag> is
                    fully integrated with Telegram via Telegram Web Apps to
                    reduce friction even further as names are automatically
                    captured through their Telegram accounts.
                </Text>
            </Stack>
            <Stack>
                <Heading fontSize={"lg"}> 🤔 Is this open source?</Heading>
                <Text>
                    {" "}
                    Yes, check out the Github Repository{" "}
                    <NavLink
                        isExternal
                        href="https://github.com/HollaG/letsmeetup-frontend"
                    >
                        {" "}
                        here
                    </NavLink>
                    .{" "}
                </Text>
            </Stack>
            <Divider />
            <Heading fontSize={"xl"}> Privacy FAQ </Heading>
            <Stack>
                <Heading fontSize={"lg"}> 🤔 Do I need to sign in?</Heading>
                <Text>
                    No, you do not need to sign in. You can continue with just a
                    name. However, signing in will allow you to easily find the
                    meetup again in future, and edit it if needed.
                </Text>
                <Text>
                    Without signing in, you will not be able to edit, end or
                    delete the meetup.
                </Text>
            </Stack>
            <Stack>
                <Heading fontSize={"lg"}> 🤔 What data do you collect?</Heading>
                <Text>
                    If you choose the sign up with an email, I only need your
                    email address and password, which are stored securely and
                    handled by Firebase Authentication.
                </Text>
                <Text>
                    {" "}
                    If you choose to sign in with Google or Github, I only get
                    your display name, profile photo, and email. I do not get
                    your password.
                </Text>
            </Stack>
            <Stack>
                <Heading fontSize={"lg"}> 🤔 Can I delete all my data?</Heading>
                <Text>
                    Yes, you can delete all your data after you are signed in.
                    Go to{" "}
                    <NavLink as={Link} to="/meetups">
                        {" "}
                        your profile page{" "}
                    </NavLink>{" "}
                    and click on the Delete all user data button.
                </Text>
                <Text>
                    {" "}
                    If you choose to sign in with Google or Github, I only get
                    your display name, profile photo, and email. I do not get
                    your password.
                </Text>
            </Stack>
            <Divider />
            <Heading fontSize={"xl"}> Tech FAQ </Heading>
            <Stack>
                <Heading fontSize={"lg"}> 🤔 What is the tech stack?</Heading>
                <Text>
                    React is used as the frontend, with Chakra UI as the UI
                    library. React-Router-Dom is used for routing, and Firebase
                    for the backend.
                </Text>
            </Stack>
            <Stack>
                <Heading fontSize={"lg"}>
                    {" "}
                    🤔 What is your hosting solution?
                </Heading>
                <Text>I use Github Pages to host the frontend.</Text>
            </Stack>
            <Stack>
                <Heading fontSize={"lg"}>
                    {" "}
                    🤔 What libraries and resources did you use?
                </Heading>

                <Text fontWeight={"semibold"}> Libraries </Text>
                <UnorderedList>
                    <ListItem>
                        <NavLink
                            href="https://reactrouter.com/en/main"
                            isExternal
                        >
                            {" "}
                            React Router{" "}
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink
                            href="https://github.com/simonwep/selection"
                            isExternal
                        >
                            {" "}
                            Viselect
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink href="https://date-fns.org/" isExternal>
                            {" "}
                            date-fns
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink
                            href="https://react-type-animation.netlify.app/"
                            isExternal
                        >
                            {" "}
                            React Type Animation
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink
                            href="https://www.npmjs.com/package/react-usestateref"
                            isExternal
                        >
                            {" "}
                            react-useStateRef
                        </NavLink>
                    </ListItem>
                </UnorderedList>
                <Text fontWeight={"semibold"}> Resources </Text>
                <UnorderedList>
                    <ListItem>
                        <NavLink
                            href="https://chakra-templates.dev/"
                            isExternal
                        >
                            {" "}
                            Chakra Templates (Layout)
                        </NavLink>
                    </ListItem>
                    <ListItem>
                        <NavLink href="https://undraw.co/" isExternal>
                            {" "}
                            unDraw (Illustrations)
                        </NavLink>
                    </ListItem>
                </UnorderedList>
            </Stack>
        </Stack>
    );
};

export default AboutPage;
