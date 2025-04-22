import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';

// Generic type for document data
export type FirestoreDocument = {
  id: string;
  [key: string]: any;
};

// Create a new document in a collection
export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
};

// Get a single document by ID
export const getDocument = async <T extends FirestoreDocument>(
  collectionName: string,
  documentId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
};

// Get all documents from a collection with optional query constraints
export const getDocuments = async <T extends FirestoreDocument>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

// Update a document
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data);
};

// Delete a document
export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

// Helper function to create a query with multiple conditions
export const createQuery = (
  field: string,
  operator: any,
  value: any,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
) => {
  const constraints: QueryConstraint[] = [where(field, operator, value)];
  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }
  return constraints;
}; 