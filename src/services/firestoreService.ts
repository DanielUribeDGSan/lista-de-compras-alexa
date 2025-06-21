/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  db,
  COLLECTION_NAME,
  SUBCOLLECTION_NAME,
  ITEMS_COLLECTION,
} from "../config/firebase";
import { GroceryItem } from "../types/grocery";

// Referencia a la colección de compras
const getComprasCollection = () => {
  return collection(db, COLLECTION_NAME, SUBCOLLECTION_NAME, ITEMS_COLLECTION);
};

// Convertir datos de Firestore a GroceryItem
const convertFirestoreToGroceryItem = (doc: any): GroceryItem => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    category: data.category,
    purchased: data.purchased,
    estimatedPrice: data.estimatedPrice,
    quantity: data.quantity,
    unit: data.unit,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Convertir GroceryItem a datos de Firestore
const convertGroceryItemToFirestore = (
  item: Omit<GroceryItem, "id" | "createdAt">
) => {
  return {
    name: item.name,
    category: item.category,
    purchased: item.purchased,
    estimatedPrice: item.estimatedPrice,
    quantity: item.quantity,
    unit: item.unit,
    createdAt: serverTimestamp(),
  };
};

// Agregar nuevo producto
export const addItemToFirestore = async (
  item: Omit<GroceryItem, "id" | "createdAt">
) => {
  try {
    const comprasRef = getComprasCollection();
    const docRef = await addDoc(
      comprasRef,
      convertGroceryItemToFirestore(item)
    );
    return docRef.id;
  } catch (error) {
    console.error("Error agregando producto:", error);
    throw error;
  }
};

// Actualizar producto
export const updateItemInFirestore = async (
  id: string,
  updates: Partial<GroceryItem>
) => {
  try {
    const itemRef = doc(
      db,
      COLLECTION_NAME,
      SUBCOLLECTION_NAME,
      ITEMS_COLLECTION,
      id
    );
    const firestoreUpdates: any = { ...updates };

    // Remover campos que no deben actualizarse
    delete firestoreUpdates.id;
    delete firestoreUpdates.createdAt;

    await updateDoc(itemRef, firestoreUpdates);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    throw error;
  }
};

// Eliminar producto
export const deleteItemFromFirestore = async (id: string) => {
  try {
    const itemRef = doc(
      db,
      COLLECTION_NAME,
      SUBCOLLECTION_NAME,
      ITEMS_COLLECTION,
      id
    );
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error eliminando producto:", error);
    throw error;
  }
};

// Suscribirse a cambios en tiempo real
export const subscribeToItems = (callback: (items: GroceryItem[]) => void) => {
  const comprasRef = getComprasCollection();
  const q = query(comprasRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(convertFirestoreToGroceryItem);
      callback(items);
    },
    (error) => {
      console.error("Error en suscripción:", error);
    }
  );
};
