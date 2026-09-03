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
} from "../config/firebase";
import { TodoItem } from "../types/todo";

const TODOS_COLLECTION = "tareas";

// Referencia a la colección de tareas
const getTodosCollection = () => {
  return collection(db, COLLECTION_NAME, SUBCOLLECTION_NAME, TODOS_COLLECTION);
};

// Convertir datos de Firestore a TodoItem
const convertFirestoreToTodoItem = (doc: any): TodoItem => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description || "",
    completed: data.completed,
    priority: data.priority || "medium",
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Convertir TodoItem a datos de Firestore
const convertTodoItemToFirestore = (
  item: Omit<TodoItem, "id" | "createdAt">
) => {
  return {
    title: item.title,
    description: item.description || "",
    completed: item.completed,
    priority: item.priority,
    createdAt: serverTimestamp(),
  };
};

// Agregar nueva tarea
export const addTodoToFirestore = async (
  item: Omit<TodoItem, "id" | "createdAt">
) => {
  try {
    const todosRef = getTodosCollection();
    const docRef = await addDoc(
      todosRef,
      convertTodoItemToFirestore(item)
    );
    return docRef.id;
  } catch (error) {
    console.error("Error agregando tarea:", error);
    throw error;
  }
};

// Actualizar tarea
export const updateTodoInFirestore = async (
  id: string,
  updates: Partial<TodoItem>
) => {
  try {
    const todoRef = doc(
      db,
      COLLECTION_NAME,
      SUBCOLLECTION_NAME,
      TODOS_COLLECTION,
      id
    );
    const firestoreUpdates: any = { ...updates };

    // Remover campos que no deben actualizarse
    delete firestoreUpdates.id;
    delete firestoreUpdates.createdAt;

    await updateDoc(todoRef, firestoreUpdates);
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    throw error;
  }
};

// Eliminar tarea
export const deleteTodoFromFirestore = async (id: string) => {
  try {
    const todoRef = doc(
      db,
      COLLECTION_NAME,
      SUBCOLLECTION_NAME,
      TODOS_COLLECTION,
      id
    );
    await deleteDoc(todoRef);
  } catch (error) {
    console.error("Error eliminando tarea:", error);
    throw error;
  }
};

// Suscribirse a cambios en tiempo real
export const subscribeToTodos = (callback: (items: TodoItem[]) => void) => {
  const todosRef = getTodosCollection();
  const q = query(todosRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(convertFirestoreToTodoItem);
      callback(items);
    },
    (error) => {
      console.error("Error en suscripción:", error);
    }
  );
};
