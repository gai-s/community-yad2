// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5twDO76aG44ng80HRILMZN2eHMIxLXSg",
  authDomain: "community-yad2.firebaseapp.com",
  projectId: "community-yad2",
  storageBucket: "community-yad2.appspot.com",
  messagingSenderId: "11606754302",
  appId: "1:11606754302:web:e59ef934807d076d1176af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()