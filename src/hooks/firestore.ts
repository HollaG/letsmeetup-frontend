import {
    doc,
    DocumentData,
    DocumentSnapshot,
    FirestoreError,
    onSnapshot,
} from "firebase/firestore";
import { db as fire } from "../firebase/index";
import { COLLECTION_NAME } from "../firebase/db/repositories/meetups";

/**
 * Handle real-time stuff https://stackoverflow.com/questions/59977856/firebase-listener-with-react-hooks
 */

// collection name

const useFirestore = () => {
    const getDocument = (
        documentPath: string,
        onUpdate: {
            next?:
                | ((snapshot: DocumentSnapshot<DocumentData>) => void)
                | undefined;
            error?: ((error: FirestoreError) => void) | undefined;
            complete?: (() => void) | undefined;
        }
    ) => {
        const d = doc(fire, COLLECTION_NAME, documentPath);
        return onSnapshot(d, onUpdate);
        // doc(documentPath).onSnapshot(onUpdate);
    };

    // const saveDocument = (documentPath, document) => {
    //     firebase.firestore().doc(documentPath).set(document);
    // };

    // const getCollection = (collectionPath, onUpdate) => {
    //     firebase.firestore().collection(collectionPath).onSnapshot(onUpdate);
    // };

    // const saveCollection = (collectionPath, collection) => {
    //     firebase.firestore().collection(collectionPath).set(collection);
    // };

    return {
        getDocument,
        // saveDocument, getCollection, saveCollection
    };
};

export default useFirestore;
