import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBwfXJP6m6CRTXAtX_CrrK8wiqWtL_RS0",
  authDomain: "desarrollo-web-5da60.firebaseapp.com",
  projectId: "desarrollo-web-5da60",
  storageBucket: "desarrollo-web-5da60.appspot.com",
  messagingSenderId: "831087627514",
  appId: "1:831087627514:web:190677d942f51a41220d43",
  measurementId: "G-WP7X7WDHC2",
};

// Inicializar Firebase solo si no existe
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializar Firestore
export const db = getFirestore(app);

// Nombre de la colección
export const COLLECTION_NAME = "col-sala";
export const SUBCOLLECTION_NAME = "lista-super";
export const ITEMS_COLLECTION = "compras";
