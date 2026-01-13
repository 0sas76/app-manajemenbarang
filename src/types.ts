export interface Item {
    item_id: string;
    name: string;
    category: string;
    qr_code_url?: string;
    status: 'Available' | 'In Use' | 'Broken';
    current_holder_id: string | null;
    current_holder_name: string | null;
    last_condition: 'Baik' | 'Rusak';
    last_updated: number; // Timestamp
}

export interface Log {
    log_id: string;
    item_id: string;
    item_name: string;
    user_id: string;
    user_name: string;
    action: 'SCAN_REPORT' | 'CHECK_OUT' | 'CHECK_IN' | 'REGISTER';
    condition_reported: string;
    timestamp: number;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    department: string;
}
