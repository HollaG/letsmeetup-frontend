// import db config
import fire from "..";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    addDoc,
} from "firebase/firestore";

const db = getFirestore(fire);
// collection name
const COLLECTION_NAME = "meetups";

// mapping the todo document
export type Todo = {
    id?: string;
    activity: string;
    date: any;
};

export type Meetup = {
    id?: string;
    creator: {
        first_name: string;
        username: string;
        user_ID: number;
        photo_url?: string;
    };
    isFullDay: boolean;
    timeslots: string[];
    dates: string[];
    users: {
        comments: string;
        selected: string[];
        user_ID: number;
        username: string;
        first_name: string;
    }[];
    date_created: Date;
    title: string;
    description?: string;
    notified: boolean
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
// export const update = async (id: string, todo: Todo): Promise<Todo> => {
//     await db.collection(COLLECTION_NAME).doc(id).update(todo);

//     // return updated todo
//     return {
//         id: id,
//         ...todo,
//     } as Todo;
// };

// // delete a todo
// export const remove = async (id: string) => {
//     await db.collection(COLLECTION_NAME).doc(id).delete();
// };
