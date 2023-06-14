import {
    Avatar,
    Badge,
    Box,
    Flex,
    Heading,
    Link,
    Text,
} from "@chakra-ui/react";
import { Meetup } from "../../../firebase/db/repositories/meetups";
import { ITelegramUser } from "../../../types/telegram";

/**
 * Renders the list of users who replied, the users who cannot make it, along with the list of users who commented.
 *
 * @param param0 The meetup
 * @returns
 */
const UsersDisplay = ({ meetup }: { meetup: Meetup }) => {
    return (
        <>
            <Heading fontSize="2xl">
                Responses (
                {meetup.users.length + meetup.cannotMakeIt?.length || 0})
            </Heading>
            {meetup.users.map((u, i) => (
                <Box key={i}>
                    {u.user.type === "telegram" ? (
                        <Link
                            href={`https://t.me/${
                                (u.user as ITelegramUser).username
                            }`}
                            isExternal
                        >
                            <Flex alignItems="center" flexWrap={"wrap"}>
                                <Avatar
                                    name={`${u.user.first_name} ${u.user.last_name}`}
                                    src={u.user.photo_url}
                                    size="xs"
                                    mr={2}
                                />
                                <Text mr={2} fontSize="md" fontWeight={"bold"}>
                                    {" "}
                                    {u.user.first_name}
                                </Text>

                                <Text fontSize="md" fontWeight={"light"}>
                                    @{(u.user as ITelegramUser).username}
                                </Text>
                            </Flex>
                        </Link>
                    ) : (
                        <Flex alignItems="center" flexWrap={"wrap"}>
                            <Avatar
                                name={`${u.user.first_name} ${u.user.last_name}`}
                                src={u.user.photo_url}
                                size="xs"
                                mr={2}
                            />
                            <Text fontSize="md" fontWeight={"bold"}>
                                {" "}
                                {u.user.first_name}
                            </Text>
                        </Flex>
                    )}

                    {/* <br /> */}
                    {u.comments && <Text fontWeight="light">{u.comments}</Text>}
                </Box>
            ))}
            {meetup.cannotMakeIt?.map((u, i) => (
                <Box key={i}>
                    {u.user.type === "telegram" ? (
                        <Link
                            href={`https://t.me/${
                                (u.user as ITelegramUser).username
                            }`}
                            isExternal
                        >
                            <Flex alignItems="center" flexWrap={"wrap"}>
                                <Avatar
                                    name={`${u.user.first_name} ${u.user.last_name}`}
                                    src={u.user.photo_url}
                                    size="xs"
                                    mr={2}
                                />
                                <Text mr={2} fontSize="md" fontWeight={"bold"}>
                                    {" "}
                                    {u.user.first_name}
                                </Text>

                                <Text mr={2} fontSize="md" fontWeight={"light"}>
                                    @{(u.user as ITelegramUser).username}
                                </Text>

                                <Badge colorScheme={"red"}>
                                    {" "}
                                    Not attending{" "}
                                </Badge>
                            </Flex>
                        </Link>
                    ) : (
                        <Flex alignItems="center" flexWrap={"wrap"}>
                            <Avatar
                                name={`${u.user.first_name} ${u.user.last_name}`}
                                src={u.user.photo_url}
                                size="xs"
                                mr={2}
                            />
                            <Text mr={2} fontSize="md" fontWeight={"bold"}>
                                {" "}
                                {u.user.first_name}
                            </Text>

                            <Badge colorScheme={"red"}> Not attending </Badge>
                        </Flex>
                    )}

                    {/* <br /> */}
                    {u.comments && <Text fontWeight="light">{u.comments}</Text>}
                </Box>
            ))}
        </>
    );
};

export default UsersDisplay;
