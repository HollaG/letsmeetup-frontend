// import db config
import { db } from "../..";
import {
    collection,
    query,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
} from "firebase/firestore";
import { ITelegramUser } from "../../../types/telegram";
import { deleteUserMeetups } from "./meetups";

export type WebUser = {
    type: string;
    id: string; // uid
    first_name: string; // displayName.split(" ")[0]
    last_name?: string; // displayName.split(" ")[1]
    email: string; // email
    photo_url?: string;
};

export type IMeetupUser = (WebUser | ITelegramUser) & {
    interacted?: string[];
};

// collection name
export const COLLECTION_NAME = "users";

export const all = async (): Promise<Array<IMeetupUser>> => {
    const q = query(collection(db, COLLECTION_NAME));
    const data: Array<any> = [];

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());

        data.push({
            ...doc.data(),
        });
    });

    // return and convert back it array of todo
    return data as Array<IMeetupUser>;
};

// create a user
export const createIfNotExists = async (
    user: IMeetupUser
): Promise<IMeetupUser> | never => {
    const dbRef = doc(db, COLLECTION_NAME, user.id.toString());
    try {
        const existing = await getDoc(dbRef);
        if (!existing.data()) {
            await setDoc(dbRef, user);
        }

        return {
            ...user,
        } as IMeetupUser;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const deleteData = async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteUserMeetups(id);
    await deleteDoc(docRef);

    return true;
};

// TODO: complete update function
// export const update = async (id: string, user: ITelegramUser): Promise<Meetup> => {
//     const docRef = doc(db, COLLECTION_NAME);
//     try {
//         const updated = await updateDoc(docRef, user);
//         return {
//             ...user
//         } as ITelegramUser;
//     } catch (e) {
//         console.log(e);
//         throw e;
//     }
//     // await db.collection(COLLECTION_NAME).doc(id).update(todo);

//     // // return updated todo
//     // return {
//     //     id: id,
//     //     ...todo,
//     // } as Todo;
// };

// // delete a todo
// export const remove = async (id: string) => {
//     await db.collection(COLLECTION_NAME).doc(id).delete();
// };
