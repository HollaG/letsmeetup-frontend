// import db config
import fire from "..";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
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
        user_ID: string;
    };
    timeslots: {
        start: Date;
        end: Date;
    }[];
    users: {
        comments: string;
        selected: number[];
        user_ID: string;
        username: string;
        first_name: string;
    }[];
    date_created: Date;
    title: string,
    description?: string
};

// retrieve all todos
export const all = async (): Promise<Array<Meetup>> => {
    const q = query(collection(db, COLLECTION_NAME));
    const data: Array<any> = [];

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        // console.log(doc.id, " => ", doc.data());

        data.push({
            id: doc.id,
            ...doc.data()
        })
    })

   

    // return and convert back it array of todo
    return data as Array<Meetup>;
};

// create a todo
// export const create = async (todo: Todo): Promise<Todo> => {
//     const docRef = await db.collection(COLLECTION_NAME).add(todo);

//     // return new created todo
//     return {
//         id: docRef.id,
//         ...todo,
//     } as Todo;
// };

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
