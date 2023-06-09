import {
    Heading,
    Stack,
    Flex,
    Text,
    Box,
    Link,
    Avatar,
    Badge,
} from "@chakra-ui/react";
import { Meetup } from "../../../firebase/db/repositories/meetups";
import { ITelegramUser } from "../../../types/telegram";

const CommentsDisplay = ({ meetup }: { meetup: Meetup }) => {
    return (
        <>
            <Heading fontSize={"lg"}>
                {" "}
                Comments (
                {meetup.users.filter((user) => user.comments).length +
                    meetup.cannotMakeIt.filter((user) => user.comments).length}
                ){" "}
            </Heading>
            <Stack mt={2}>
                {meetup.users
                    .filter((user) => user.comments)
                    .map((user, i) => (
                        <Box key={i}>
                            {user.user.type === "telegram" ? (
                                <Link
                                    href={`https://t.me/${
                                        (user.user as ITelegramUser).username
                                    }`}
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
                                        {user.user.type === "telegram" && (
                                            <Text
                                                ml={2}
                                                fontSize="md"
                                                fontWeight={"light"}
                                            >
                                                @
                                                {
                                                    (user.user as ITelegramUser)
                                                        .username
                                                }
                                            </Text>
                                        )}
                                    </Flex>
                                </Link>
                            ) : (
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
                                    {user.user.type === "telegram" && (
                                        <Text
                                            ml={2}
                                            fontSize="md"
                                            fontWeight={"light"}
                                        >
                                            @
                                            {
                                                (user.user as ITelegramUser)
                                                    .username
                                            }
                                        </Text>
                                    )}
                                </Flex>
                            )}

                            {/* <br /> */}
                            <Text fontWeight="light">{user.comments}</Text>
                        </Box>
                    ))}
                {meetup.cannotMakeIt
                    .filter((user) => user.comments)
                    .map((user, i) => (
                        <Box
                            key={
                                i +
                                meetup.users.filter((user) => user.comments)
                                    .length
                            }
                        >
                            {user.user.type === "telegram" ? (
                                <Link
                                    href={`https://t.me/${
                                        (user.user as ITelegramUser).username
                                    }`}
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
                                            @
                                            {
                                                (user.user as ITelegramUser)
                                                    .username
                                            }{" "}
                                            <Badge colorScheme={"red"}>
                                                {" "}
                                                Not attending{" "}
                                            </Badge>
                                        </Text>
                                    </Flex>
                                </Link>
                            ) : (
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
                                        {user.user.first_name}{" "}
                                        <Badge colorScheme={"red"}>
                                            {" "}
                                            Not attending{" "}
                                        </Badge>
                                    </Text>
                                </Flex>
                            )}

                            {/* <br /> */}
                            <Text fontWeight="light">{user.comments}</Text>
                        </Box>
                    ))}
            </Stack>
        </>
    );
};

export default CommentsDisplay;
