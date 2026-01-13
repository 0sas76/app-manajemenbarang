import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../../services/firestoreService';
import type { UserProfile } from '../../types';
import { Trash2, Edit2, Plus, Search, Loader2 } from 'lucide-react';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<Partial<UserProfile>>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const fetchedUsers = await FirestoreService.getUsers();
        setUsers(fetchedUsers);
        setLoading(false);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (user: UserProfile) => {
        setCurrentUser(user);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentUser({ uid: `USR-${Date.now()}`, role: 'user', department: '' });
        setIsEditing(true);
    };

    const handleDelete = async (uid: string) => {
        if (window.confirm('Archive this team member?')) {
            await FirestoreService.deleteUser(uid);
            fetchUsers();
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser.uid && currentUser.name && currentUser.email) {
            await FirestoreService.saveUser(currentUser as UserProfile);
            setIsEditing(false);
            fetchUsers();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-700" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tightest text-neutral-main">Management</h2>
                        <p className="text-sm font-semibold text-neutral-soft">{users.length} members onboarded</p>
                    </div>
                    <button onClick={handleCreate} className="w-12 h-12 bg-neutral-main text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 transition-colors shadow-premium active:scale-95">
                        <Plus size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-soft" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="input-modern pl-12 h-14 text-sm font-semibold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-main/20 backdrop-blur-md animate-fade-in">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-modal border border-surface-200 animate-scale-in">
                        <div className="flex flex-col gap-1 mb-8">
                            <h3 className="text-xl font-black tracking-tightest">Member Details</h3>
                            <p className="text-xs font-bold text-neutral-soft uppercase tracking-widest">Enrollment Form</p>
                        </div>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-soft ml-1">Full Name</label>
                                <input
                                    type="text"
                                    className="input-modern"
                                    value={currentUser.name || ''}
                                    onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-soft ml-1">Work Email</label>
                                <input
                                    type="email"
                                    className="input-modern"
                                    value={currentUser.email || ''}
                                    onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-soft ml-1">Dept</label>
                                    <input
                                        type="text"
                                        className="input-modern"
                                        value={currentUser.department || ''}
                                        onChange={e => setCurrentUser({ ...currentUser, department: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-soft ml-1">Access Level</label>
                                    <select
                                        className="input-modern h-12"
                                        value={currentUser.role || 'user'}
                                        onChange={e => setCurrentUser({ ...currentUser, role: e.target.value as any })}
                                    >
                                        <option value="user">Member</option>
                                        <option value="admin">Global Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 btn-secondary rounded-2xl">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-[2] btn-primary rounded-2xl bg-brand-700">
                                    Confirm Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Premium Rich List (Mobile First) */}
            <div className="space-y-3">
                {filteredUsers.map(user => (
                    <div key={user.uid} className="card-premium flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700 font-black text-xl border border-brand-100 uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-neutral-main tracking-tight">{user.name}</span>
                                <span className="text-[10px] font-bold text-neutral-soft uppercase tracking-wider">{user.role} • {user.department || 'General'}</span>
                                <span className="text-[10px] font-medium text-neutral-soft mt-1 opacity-70 lowercase">{user.email}</span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => handleEdit(user)} className="w-10 h-10 flex items-center justify-center text-neutral-soft hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-all">
                                <Edit2 size={16} />
                            </button>
                            {user.role !== 'admin' && (
                                <button onClick={() => handleDelete(user.uid)} className="w-10 h-10 flex items-center justify-center text-neutral-soft hover:text-status-error hover:bg-status-error_bg rounded-xl transition-all">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && <div className="text-center py-20 text-neutral-soft font-bold opacity-30 uppercase tracking-widest text-xs">No team results</div>}
            </div>
        </div>
    );
};

export default UserManagement;
