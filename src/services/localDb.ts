import type { Item, Log, UserProfile } from '../types';

const INITIAL_ITEMS: Item[] = [
    {
        item_id: 'ITM-001',
        name: 'Laptop Dell XPS 13',
        category: 'Electronics',
        status: 'Available',
        current_holder_id: null,
        current_holder_name: null,
        last_condition: 'Baik',
        last_updated: Date.now()
    },
    {
        item_id: 'ITM-002',
        name: 'Proyektor Epson',
        category: 'Equipment',
        status: 'In Use',
        current_holder_id: 'USR-001',
        current_holder_name: 'Budi Santoso',
        last_condition: 'Baik',
        last_updated: Date.now() - 100000
    },
    {
        item_id: 'ITM-003',
        name: 'Kamera Canon DSLR',
        category: 'Electronics',
        status: 'Broken',
        current_holder_id: null,
        current_holder_name: null,
        last_condition: 'Rusak',
        last_updated: Date.now() - 500000
    }
];

const INITIAL_USERS: UserProfile[] = [
    { uid: 'ADM-001', name: 'Admin Utama', email: 'admin@company.com', role: 'admin', department: 'IT' },
    { uid: 'USR-001', name: 'Budi Santoso', email: 'budi@company.com', role: 'user', department: 'Humas' },
    { uid: 'USR-002', name: 'Siti Aminah', email: 'siti@company.com', role: 'user', department: 'Keuangan' }
];

export const LocalDb = {
    // --- Items ---
    getItems: (): Item[] => {
        const data = localStorage.getItem('items');
        if (!data) {
            localStorage.setItem('items', JSON.stringify(INITIAL_ITEMS));
            return INITIAL_ITEMS;
        }
        return JSON.parse(data);
    },

    getItem: (id: string): Item | undefined => {
        const items = LocalDb.getItems();
        return items.find(i => i.item_id === id);
    },

    saveItem: (item: Item) => {
        const items = LocalDb.getItems();
        const index = items.findIndex(i => i.item_id === item.item_id);
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        localStorage.setItem('items', JSON.stringify(items));
    },

    deleteItem: (id: string) => {
        const items = LocalDb.getItems().filter(i => i.item_id !== id);
        localStorage.setItem('items', JSON.stringify(items));
    },

    // --- Logs ---
    getLogs: (): Log[] => {
        const data = localStorage.getItem('logs');
        return data ? JSON.parse(data) : [];
    },

    addLog: (log: Log) => {
        const logs = LocalDb.getLogs();
        logs.unshift(log); // Add to top
        localStorage.setItem('logs', JSON.stringify(logs));
    },

    // --- Auth & Users ---
    login: (role: 'admin' | 'user') => {
        // For demo, just picking the first matching role
        const users = LocalDb.getUsers();
        const profile = users.find(u => u.role === role) || users[0];
        localStorage.setItem('currentUser', JSON.stringify(profile));
        return profile;
    },

    getCurrentUser: (): UserProfile | null => {
        const data = localStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    },

    logout: () => {
        localStorage.removeItem('currentUser');
    },

    getUsers: (): UserProfile[] => {
        const data = localStorage.getItem('users');
        if (!data) {
            localStorage.setItem('users', JSON.stringify(INITIAL_USERS));
            return INITIAL_USERS;
        }
        return JSON.parse(data);
    },

    saveUser: (user: UserProfile) => {
        const users = LocalDb.getUsers();
        const index = users.findIndex(u => u.uid === user.uid);
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem('users', JSON.stringify(users));
    },

    deleteUser: (uid: string) => {
        const users = LocalDb.getUsers().filter(u => u.uid !== uid);
        localStorage.setItem('users', JSON.stringify(users));
    }
};
