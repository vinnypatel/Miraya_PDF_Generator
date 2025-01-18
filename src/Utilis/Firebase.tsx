import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBvQ4qWNda7_v61tYT9-p8sXavm2Cm8OCA",
    authDomain: "fir-withswiftui-b3be8.firebaseapp.com",
    projectId: "fir-withswiftui-b3be8",
    storageBucket: "fir-withswiftui-b3be8.firebasestorage.app",
    messagingSenderId: "209216700743",
    appId: "1:209216700743:web:82375fc2a07a639a3d4c62"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);