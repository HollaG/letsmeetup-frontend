// import db config
import fire, { db } from "..";
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
import { ITelegramUser } from "../../types/telegram";
import { swapDateTimeStr } from "../../routes/meetup";

// collection name
export const COLLECTION_NAME = "meetups";

// mapping the todo document
export type Todo = {
    id?: string;
    activity: string;
    date: any;
};

export type Meetup = {
    id?: string;
    creator: ITelegramUser;
    isFullDay: boolean;
    timeslots: string[];
    dates: string[];
    users: UserAvailabilityData[];
    date_created: Date;
    title: string;
    description?: string;
    notified: boolean;
    selectionMap: {
        [dateOrTimeStr: string]: ITelegramUser[];
    };
};

export type UserAvailabilityData = {
    comments: string;
    selected: string[]; // either it's a string like this: 540::2023-05-02 (!isFullDay) or it's a string like this: 2023-05-02 (isFullDay)
    user: ITelegramUser;
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

// // update a todo
export const update = async (id: string, meetup: Meetup): Promise<Meetup> => {
    const docRef = doc(db, COLLECTION_NAME);
    try {
        const updated = await updateDoc(docRef, meetup);
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
    user: ITelegramUser,
    {
        datesSelected,
        timesSelected,
    }: // isFullDay,
    {
        datesSelected: string[];
        timesSelected: string[];
        // isFullDay: boolean;
    }
): Promise<Meetup> => {
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
        newAvailabilityData = [
            ...oldUsers,
            {
                comments: "", // TODO
                selected: isFullDay ? datesSelected : timesSelected,
                user,
            },
        ];
    } else {
        newAvailabilityData = oldUsers.map((u) => {
            if (u.user.id === user.id) {
                return {
                    ...u,
                    selected: isFullDay ? datesSelected : timesSelected,
                };
            } else {
                return u;
            }
        });
    }

    // update the selectionMap
    let newMap: { [key: string]: ITelegramUser[] } = {};

    // first, remove this user from the selectionMap
    for (let dateTimeStr in oldMeetup.selectionMap) {
        const res = oldMeetup.selectionMap[dateTimeStr].filter(
            (u) => u.id !== user.id
        );
        res.length && (newMap[(dateTimeStr)] = res);
    }
    if (isFullDay) {
        datesSelected.forEach((date) => {
            if (!newMap[(date)]) {
                newMap[(date)] = [user];
            } else {
                newMap[(date)].push(user);
            }
        });
    } else {
        timesSelected.forEach((time) => {
            if (!newMap[(time)]) {
                newMap[(time)] = [user];
            } else {
                newMap[(time)].push(user);
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
