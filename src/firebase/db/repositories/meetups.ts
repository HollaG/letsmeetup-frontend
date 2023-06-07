// import db config
import fire, { db } from "../..";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import { ITelegramUser } from "../../../types/telegram";
import { swapDateTimeStr } from "../../../routes/meetup";
import { IMeetupUser } from "./users";

// collection name
export const COLLECTION_NAME =
    process.env.REACT_APP_COLLECTION_NAME || "meetups";

// mapping the todo document
export type Todo = {
    id?: string;
    activity: string;
    date: any;
};

export type Meetup = {
    id?: string;
    creator: IMeetupUser;
    isFullDay: boolean;
    timeslots: string[];
    dates: string[];
    users: UserAvailabilityData[];
    date_created: Date;
    title: string;
    description?: string;
    notified: boolean;
    selectionMap: {
        [dateOrTimeStr: string]: IMeetupUser[];
    };
    messages: {
        message_id: number;
        message_thread_id?: number;
        chat_id: number;
        inline_message_id?: string;
    }[];
    isEnded: boolean;
    creatorInfoMessageId: number;

    options: {
        notificationThreshold: number;
        limitPerSlot: number;
        limitNumberRespondents: number;
        limitSlotsPerRespondent: number;
    };
};

export type UserAvailabilityData = {
    comments: string;
    selected: string[]; // either it's a string like this: 540::2023-05-02 (!isFullDay) or it's a string like this: 2023-05-02 (isFullDay)
    user: IMeetupUser;
    // user_ID: number;
    // username: string;
    // first_name: string;
};

// retrieve all todos
export const all = async (): Promise<Array<Meetup>> => {
    const q = query(collection(db, COLLECTION_NAME));
    const data: Array<any> = [];

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());

        data.push({
            id: doc.id,
            ...doc.data(),
        });
    });

    // return and convert back it array of todo
    return data as Array<Meetup>;
};

// create a Meetup
export const create = async (meetup: Meetup): Promise<Meetup> | never => {
    console.log("Creating!");
    const dbRef = collection(db, COLLECTION_NAME);
    try {
        const docRef = await addDoc(dbRef, meetup);
        return {
            id: docRef.id,
            ...meetup,
        } as Meetup;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const update = async (id: string, meetup: Meetup): Promise<Meetup> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
        const updated = await updateDoc(docRef, { ...meetup });
        return {
            id: docRef.id,
            ...meetup,
        } as Meetup;
    } catch (e) {
        console.log(e);
        throw e;
    }
    // await db.collection(COLLECTION_NAME).doc(id).update(todo);

    // // return updated todo
    // return {
    //     id: id,
    //     ...todo,
    // } as Todo;
};

export const updateAvailability = async (
    id: string,
    user: IMeetupUser | undefined,

    {
        datesSelected,
        timesSelected,
    }: // isFullDay,
    {
        datesSelected: string[];
        timesSelected: string[];
        // isFullDay: boolean;
    },
    comments: string = ""
): Promise<Meetup | null> => {
    console.log("--------------------");
    console.log(datesSelected, timesSelected, comments);

    if (!user) return null;
    const docRef = doc(db, COLLECTION_NAME, id);
    const oldMeetup = (await getDoc(docRef)).data() as Meetup;
    if (!oldMeetup) {
        throw new Error("Meetup not found");
    }

    const oldUsers = oldMeetup.users;
    const isFullDay = oldMeetup.isFullDay;

    const previousUserData = oldUsers.find((u) => u.user.id === user.id);

    let newAvailabilityData: UserAvailabilityData[] = [];
    if (!previousUserData) {
        // this user has not selected anything yet
        newAvailabilityData = [
            ...oldUsers,
            {
                comments, // TODO
                selected: isFullDay ? datesSelected : timesSelected,
                user,
            },
        ];
    } else {
        // this user has already selected something
        if (
            (isFullDay && !datesSelected.length) ||
            (!isFullDay && !timesSelected.length)
        ) {
            // this user has unselected everything
            newAvailabilityData = oldUsers.filter((u) => u.user.id !== user.id);
        } else {
            newAvailabilityData = oldUsers.map((u) => {
                if (u.user.id === user.id) {
                    return {
                        ...u,
                        comments,
                        selected: isFullDay ? datesSelected : timesSelected,
                    };
                } else {
                    return u;
                }
            });
        }
    }

    // remove all users who have not selected anything
    newAvailabilityData = newAvailabilityData.filter((u) => u.selected.length);

    //TODO (to check:) remove all users who have selected things that are not in selectionMap
    // newAvailabilityData = newAvailabilityData.filter((u) => u.selected.some((s) => oldMeetup.selectionMap[s]))

    // update the selectionMap
    let newMap: { [key: string]: IMeetupUser[] } = {};

    // first, remove this user from the selectionMap
    for (let dateTimeStr in oldMeetup.selectionMap) {
        const res = oldMeetup.selectionMap[dateTimeStr].filter(
            (u) => u.id !== user.id
        );
        res.length && (newMap[dateTimeStr] = res);
    }
    if (isFullDay) {
        datesSelected.forEach((date) => {
            if (!newMap[date]) {
                newMap[date] = [user];
            } else {
                newMap[date].push(user);
            }
        });
    } else {
        timesSelected.forEach((time) => {
            if (!newMap[time]) {
                newMap[time] = [user];
            } else {
                newMap[time].push(user);
            }
        });
    }

    console.log({ newMap });

    try {
        const updated = await updateDoc(docRef, {
            users: newAvailabilityData,
            selectionMap: newMap,
        });
        return {
            id: docRef.id,
            ...oldMeetup,
            users: newAvailabilityData,
            selectionMap: newMap,
        } as Meetup;
    } catch (e) {
        console.log(e);
        throw e;
    }
    // await db.collection(COLLECTION_NAME).doc(id).update(todo);

    // // return updated todo
    // return {
    //     id: id,
    //     ...todo,
    // } as Todo;
};

// // delete a todo
// export const remove = async (id: string) => {
//     await db.collection(COLLECTION_NAME).doc(id).delete();
// };
