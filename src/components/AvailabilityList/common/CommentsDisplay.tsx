import {
    Heading,
    Stack,
    Flex,
    Text,
    Box,
    Link,
    Avatar,
} from "@chakra-ui/react";
import { Meetup } from "../../../firebase/db/repositories/meetups";

const CommentsDisplay = ({ meetup }: { meetup: Meetup }) => {
    return (
        <>
            <Heading fontSize={"lg"}>
                {" "}
                Comments ({
                    meetup.users.filter((user) => user.comments).length
                }){" "}
            </Heading>
            <Stack mt={2}>
                {meetup.users
                    .filter((user) => user.comments)
                    .map((user, i) => (
                        <Box key={i}>
                            <Link
                                href={`https://t.me/${user.user.username}`}
                                isExternal
                            >
                                <Flex alignItems="center">
                                    <Avatar
                                        name={`${user.user.first_name} ${user.user.last_name}`}
                                        src={user.user.photo_url}
                                        size="xs"
                                    />
                                    <Text
                                        ml={2}
                                        fontSize="md"
                                        fontWeight={"bold"}
                                    >
                                        {" "}
                                        {user.user.first_name}
                                    </Text>
                                    <Text
                                        ml={2}
                                        fontSize="md"
                                        fontWeight={"light"}
                                    >
                                        @{user.user.username}
                                    </Text>
                                </Flex>
                            </Link>

                            {/* <br /> */}
                            <Text fontWeight="light">{user.comments}</Text>
                        </Box>
                    ))}
                <Flex></Flex>
            </Stack>
        </>
    );
};

export default CommentsDisplay;
