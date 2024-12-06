import { doc, addDoc, collection, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import { BlockFunctions } from "./BlockFunctions";

const db = getFirestore(app);
export const FirebaseFunctions = {
    uploadIP: async (id, name, creator, description) => {
        try {
            const docRef = await addDoc(collection(db, "ip"), { id, name, creator, description });
            console.log("Document written with ID: ", docRef.id);
        } catch (error) {

        }
    },
    getData: async (txt) => {
        try {
            const text = txt.toLowerCase()
            const querySnapshot = await getDocs(collection(db, "ip"));
            let ips = []
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (FirebaseFunctions.searchText(data, text)) {
                    ips.push({ ...data })
                }
            });
            return ips;
        } catch (error) {
            return []
        }
    },
    searchText: (data, text) => {
        if (
            FirebaseFunctions.KMP(data.id, text) ||
            FirebaseFunctions.KMP(data.description.toLowerCase(), text) ||
            FirebaseFunctions.KMP(data.name.toLowerCase(), text) ||
            FirebaseFunctions.KMP(data.creator.toLowerCase(), text))
            return true;

        return false
    },
    KMP: (text, pattern) => {
        const lps = FirebaseFunctions.computeLPSArray(pattern);
        let i = 0; // index for text[]
        let j = 0; // index for pattern[]
        while (i < text.length) {
            if (pattern[j] === text[i]) {
                i++;
                j++;
            }
            if (j === pattern.length) {
                return true
            } else if (i < text.length && pattern[j] !== text[i]) {
                if (j !== 0) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }
        return false;
    },
    computeLPSArray: (pattern) => {
        const lps = [0];
        let len = 0;
        let i = 1;
        while (i < pattern.length) {
            if (pattern[i] === pattern[len]) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len !== 0) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        return lps;
    },

}