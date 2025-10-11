import { Firestore, getDoc, doc } from "firebase/firestore";

export const getConfigField = async (db: Firestore, id: string, field: string) => {
    const docRef = doc(db, "config", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return docSnap.data()[field];
    } else {
        return null;
    }
}