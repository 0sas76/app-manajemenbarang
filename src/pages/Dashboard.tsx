import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import type { Item } from '../types';
import { Box, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHome from './admin/AdminHome';
import UserManagement from './admin/UserManagement';
import ItemManagement from './admin/ItemManagement';

const Dashboard: React.FC = () => {
    const { userProfile, loading } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    useEffect(() => {
        const fetchItems = async () => {
            const fetchedItems = await FirestoreService.getItems();
            setItems(fetchedItems);
            setLoadingItems(false);
        };
        fetchItems();
    }, []);

    if (loading || loadingItems) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <p className="text-lg font-bold text-neutral-main mb-2">Profil tidak ditemukan</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="btn-primary mt-4"
                >
                    Kembali ke Login
                </button>
            </div>
        );
    }

    return userProfile.role === 'admin'
        ? <AdminDashboard activeTab={activeTab} />
        : <UserDashboard user={userProfile} items={items} />;
};

const AdminDashboard = ({ activeTab }: { activeTab: string }) => {
    return (
        <div className="flex flex-col gap-8 animate-fade-in relative">
            {/* Nav tabs moved to bottom dock in Layout.tsx */}
            <div className="flex-1">
                {activeTab === 'dashboard' && <AdminHome />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'items' && <ItemManagement />}
            </div>
        </div>
    );
};

const UserDashboard = ({ user, items }: { user: any, items: Item[] }) => {
    const myItems = items.filter(i => i.current_holder_id === user.uid);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Minimal Welcome Card */}
            <div className="bg-brand-teal p-8 rounded-[2.5rem] text-white">
                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Halo,</span>
                <h2 className="text-3xl font-black mt-1">{user.name.split(' ')[0]}</h2>
                <p className="text-sm opacity-80 mt-2">Anda memegang {myItems.length} aset aktif.</p>

                <button
                    onClick={() => navigate('/scan')}
                    className="mt-6 w-full py-4 bg-white text-brand-teal rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors"
                >
                    Mulai Scan <ChevronRight size={18} />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-soft px-2">Inventaris Anda</h3>
                <div className="grid gap-3">
                    {myItems.map(item => (
                        <div key={item.item_id}
                            className="card-premium flex justify-between items-center cursor-pointer"
                            onClick={() => navigate(`/item/${item.item_id}`)}>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-2xl bg-surface-50 flex items-center justify-center text-brand-teal border border-surface-200">
                                    <Box size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-neutral-main">{item.name}</span>
                                    <span className="text-[10px] text-neutral-soft font-bold uppercase">{item.category}</span>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-neutral-soft" />
                        </div>
                    ))}
                    {myItems.length === 0 && (
                        <div className="text-center py-16 bg-surface-50 rounded-[2rem] border-2 border-dashed border-surface-200">
                            <Box size={32} className="mx-auto text-neutral-soft opacity-30 mb-2" />
                            <p className="text-neutral-soft text-sm font-bold">Belum ada aset</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
