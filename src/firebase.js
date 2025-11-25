import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBi-Kny5FJKc3Rt6sNPGi4iaLEd--Vt6Zs",
    authDomain: "autoguyana-3ebef.firebaseapp.com",
    projectId: "autoguyana-3ebef",
    storageBucket: "autoguyana-3ebef.firebasestorage.app",
    messagingSenderId: "1077714082278",
    appId: "1:1077714082278:web:2e1e73cd8e3d3bbd985e27"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
