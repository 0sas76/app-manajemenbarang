import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Item, Log, UserProfile } from '../types';

// ============= ITEMS =============

export const getItems = async (): Promise<Item[]> => {
    try {
        const itemsRef = collection(db, 'items');
        const q = query(itemsRef, orderBy('last_updated', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Item);
    } catch (error) {
        console.error('Error getting items:', error);
        return [];
    }
};

export const getItem = async (itemId: string): Promise<Item | null> => {
    try {
        const itemDoc = await getDoc(doc(db, 'items', itemId));
        if (itemDoc.exists()) {
            return itemDoc.data() as Item;
        }
        return null;
    } catch (error) {
        console.error('Error getting item:', error);
        return null;
    }
};

export const saveItem = async (item: Item): Promise<void> => {
    try {
        await setDoc(doc(db, 'items', item.item_id), {
            ...item,
            last_updated: Date.now()
        });
    } catch (error) {
        console.error('Error saving item:', error);
        throw error;
    }
};

export const updateItem = async (itemId: string, updates: Partial<Item>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'items', itemId), {
            ...updates,
            last_updated: Date.now()
        });
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
};

export const deleteItem = async (itemId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'items', itemId));
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};

// ============= LOGS =============

export const getLogs = async (): Promise<Log[]> => {
    try {
        const logsRef = collection(db, 'logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            log_id: doc.id
        } as Log));
    } catch (error) {
        console.error('Error getting logs:', error);
        return [];
    }
};

export const addLog = async (log: Omit<Log, 'log_id'>): Promise<void> => {
    try {
        await addDoc(collection(db, 'logs'), {
            ...log,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error adding log:', error);
        throw error;
    }
};

// ============= USERS =============

export const getUsers = async (): Promise<UserProfile[]> => {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        return snapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

export const getUser = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const saveUser = async (user: UserProfile): Promise<void> => {
    try {
        await setDoc(doc(db, 'users', user.uid), user);
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};

export const updateUser = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'users', uid), updates);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (uid: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Export as a namespace for easier imports
export const FirestoreService = {
    // Items
    getItems,
    getItem,
    saveItem,
    updateItem,
    deleteItem,
    // Logs
    getLogs,
    addLog,
    // Users
    getUsers,
    getUser,
    saveUser,
    updateUser,
    deleteUser
};
