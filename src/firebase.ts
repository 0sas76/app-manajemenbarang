import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBIF_55xeUf-LFnxKb0HC5svL3f313HViY",
    authDomain: "app-manajemen-aset.firebaseapp.com",
    projectId: "app-manajemen-aset",
    storageBucket: "app-manajemen-aset.firebasestorage.app",
    messagingSenderId: "87278138488",
    appId: "1:87278138488:web:5df7b37ece2608866aa98d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
