import React, { useMemo, useState, useEffect } from 'react';
import { FirestoreService } from '../../services/firestoreService';
import type { Item, UserProfile } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Box, User, AlertTriangle, Activity, Loader2 } from 'lucide-react';

const AdminHome: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [fetchedItems, fetchedUsers] = await Promise.all([
                FirestoreService.getItems(),
                FirestoreService.getUsers()
            ]);
            setItems(fetchedItems);
            setUsers(fetchedUsers);
            setLoading(false);
        };
        fetchData();
    }, []);

    const stats = useMemo(() => ({
        totalItems: items.length,
        itemsInUse: items.filter(i => i.status === 'In Use').length,
        itemsBroken: items.filter(i => i.status === 'Broken').length,
        itemsAvailable: items.filter(i => i.status === 'Available').length,
        totalUsers: users.length,
    }), [items, users]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
        );
    }

    const statusData = [
        { name: 'Tersedia', value: stats.itemsAvailable, color: '#4A827B' }, // Sage
        { name: 'Digunakan', value: stats.itemsInUse, color: '#0D5C63' }, // Teal
        { name: 'Rusak', value: stats.itemsBroken, color: '#F2945D' }, // Orange
    ];

    const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
        <div className="card-premium flex flex-col gap-4">
            <div className={`w-10 h-10 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-10 bg-')} flex items-center justify-center`}>
                <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-soft uppercase tracking-widest">{label}</span>
                <span className="text-2xl font-black text-neutral-main">{value}</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-10 animate-fade-in">
            {/* Horizontal Stats */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                <div className="min-w-[140px] flex-1">
                    <StatCard icon={Box} label="TOTAL" value={stats.totalItems} colorClass="bg-brand-teal" />
                </div>
                <div className="min-w-[140px] flex-1">
                    <StatCard icon={Activity} label="READY" value={stats.itemsAvailable} colorClass="bg-brand-sage" />
                </div>
                <div className="min-w-[140px] flex-1">
                    <StatCard icon={AlertTriangle} label="BROKEN" value={stats.itemsBroken} colorClass="bg-brand-orange" />
                </div>
                <div className="min-w-[140px] flex-1">
                    <StatCard icon={User} label="TEAM" value={stats.totalUsers} colorClass="bg-brand-sand" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Clean Pie Chart */}
                <div className="card-premium">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-soft mb-6">Distribusi Status</h3>
                    <div className="h-48 w-full block min-h-[192px] relative">
                        <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-bold text-neutral-soft uppercase">Total</span>
                            <span className="text-xl font-black">{stats.totalItems}</span>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-6">
                        {statusData.map(d => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-[10px] font-bold text-neutral-muted uppercase">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simplified Bar Chart */}
                <div className="card-premium">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-soft mb-6">Statistik Kondisi</h3>
                    <div className="h-48 w-full block min-h-[192px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                            <BarChart data={statusData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#fcfaf8' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={24}>
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
