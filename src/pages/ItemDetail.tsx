import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import type { Item } from '../types';
import { ArrowLeft, Box, User, Clock, CheckCircle, AlertTriangle, XCircle, Info, Hash, MapPin, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const ItemDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userProfile } = useAuth();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            if (id) {
                setLoading(true);
                const fetchedItem = await FirestoreService.getItem(id);
                setItem(fetchedItem);
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-700" />
            </div>
        );
    }

    if (!item || !userProfile) return (
        <div className="h-full flex items-center justify-center flex-col text-neutral-soft p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-surface-100 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Info size={40} className="text-surface-300" />
            </div>
            <h2 className="text-xl font-black tracking-tightest text-neutral-main mb-2">Resource Missing</h2>
            <p className="text-sm font-medium mb-8">The identification code provided does not exist in our secure vault.</p>
            <button onClick={() => navigate(-1)} className="btn-primary w-full max-w-[200px]">Go Back</button>
        </div>
    );

    const handleAction = async (action: 'USE' | 'RETURN' | 'BROKEN') => {
        setActionLoading(true);
        try {
            let updates: Partial<Item> = {};
            let logAction = '';

            if (action === 'USE') {
                updates = {
                    status: 'In Use',
                    current_holder_id: userProfile.uid,
                    current_holder_name: userProfile.name,
                    last_condition: 'Baik'
                };
                logAction = 'CHECK_OUT';
            } else if (action === 'RETURN') {
                updates = {
                    status: 'Available',
                    current_holder_id: null,
                    current_holder_name: null,
                    last_condition: 'Baik'
                };
                logAction = 'CHECK_IN';
            } else if (action === 'BROKEN') {
                updates = {
                    status: 'Broken',
                    last_condition: 'Rusak'
                };
                logAction = 'SCAN_REPORT';
            }

            await FirestoreService.updateItem(item.item_id, updates);
            await FirestoreService.addLog({
                item_id: item.item_id,
                item_name: item.name,
                user_id: userProfile.uid,
                user_name: userProfile.name,
                action: logAction as any,
                condition_reported: updates.last_condition || item.last_condition,
                timestamp: Date.now()
            });

            // Refresh item data
            const updatedItem = await FirestoreService.getItem(item.item_id);
            setItem(updatedItem);
        } catch (error) {
            console.error('Error performing action:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const isHolder = item.current_holder_id === userProfile.uid;

    return (
        <div className="min-h-full bg-surface-50 animate-fade-in relative pb-10">

            {/* Immersive Header Backdrop */}
            <div className="absolute top-0 left-0 w-full h-64 bg-brand-700 z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-200/5 rounded-full blur-[60px] -ml-24 -mb-24" />
            </div>

            {/* Modern Navigation Header */}
            <div className="relative z-10 px-6 pt-6 flex items-center justify-between pointer-events-none">
                <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md pointer-events-auto hover:bg-white/20 transition-all">
                    <ArrowLeft size={22} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Asset Dossier</span>
                <div className="w-12 h-12" />
            </div>

            <div className="relative z-10 px-6 pt-8 max-w-2xl mx-auto space-y-8">

                {/* Elite Identity Card */}
                <div className="card-premium bg-white shadow-elevated p-8 border-none rounded-[2.5rem] relative overflow-hidden animate-slide-up">
                    <div className={clsx(
                        "absolute top-8 right-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current",
                        item.status === 'Available' ? "text-status-success bg-status-success_bg" :
                            item.status === 'Broken' ? "text-status-error bg-status-error_bg" : "text-status-info bg-status-info_bg"
                    )}>
                        {item.status}
                    </div>

                    <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-2 text-neutral-soft font-black text-[10px] uppercase tracking-widest">
                            <Hash size={12} className="text-brand-700" /> {item.item_id}
                        </div>
                        <h2 className="text-4xl font-black text-neutral-main leading-tight tracking-tightest">{item.name}</h2>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-surface-100 text-neutral-muted rounded-xl text-[10px] font-black uppercase tracking-wider">{item.category}</span>
                            {item.last_condition === 'Rusak' && <span className="px-3 py-1 bg-status-error text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><AlertTriangle size={10} /> Reported Broken</span>}
                        </div>
                    </div>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-2 gap-4 border-t border-surface-100 pt-8">
                        <DetailRow icon={User} label="Current User" value={item.current_holder_name || 'System Storage'} brand />
                        <DetailRow icon={MapPin} label="Condition" value={item.last_condition} status={item.last_condition === 'Rusak' ? 'error' : 'success'} />
                        <DetailRow icon={Clock} label="Synchronized" value={new Date(item.last_updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} />
                        <DetailRow icon={Box} label="Network" value="Internal Asset" />
                    </div>
                </div>

                {/* Tactical Actions */}
                <div className="space-y-4 animate-slide-up delay-100">
                    <h3 className="text-[10px] font-black text-neutral-soft uppercase tracking-[0.25em] pl-2 mb-4 opacity-50">Authorized Actions</h3>

                    {item.status === 'Available' && (
                        <button
                            onClick={() => handleAction('USE')}
                            disabled={actionLoading}
                            className="w-full btn-primary h-20 text-sm font-black uppercase tracking-widest gap-4 rounded-[1.75rem] shadow-elevated transition-all active:scale-95 group"
                        >
                            {actionLoading ? (
                                <Loader2 size={22} className="animate-spin" />
                            ) : (
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <CheckCircle size={22} strokeWidth={2.5} />
                                </div>
                            )}
                            Claim Ownership
                        </button>
                    )}

                    {isHolder && (
                        <button
                            onClick={() => handleAction('RETURN')}
                            disabled={actionLoading}
                            className="w-full h-20 bg-neutral-main text-white py-4 rounded-[1.75rem] font-black uppercase tracking-widest shadow-modal flex items-center justify-center space-x-4 transition-all active:scale-95 hover:bg-neutral-900 border border-white/5"
                        >
                            {actionLoading ? (
                                <Loader2 size={22} className="animate-spin" />
                            ) : (
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <XCircle size={22} strokeWidth={2.5} />
                                </div>
                            )}
                            Synchronize Return
                        </button>
                    )}

                    {/* Dynamic Report Section */}
                    {(isHolder || userProfile.role === 'admin' || item.status === 'Available') && (
                        <button
                            onClick={() => handleAction('BROKEN')}
                            disabled={actionLoading}
                            className="w-full bg-surface-pure text-status-error border border-status-error/20 hover:bg-status-error_bg h-20 rounded-[1.75rem] font-black uppercase tracking-widest flex items-center justify-center space-x-4 transition-all active:scale-95"
                        >
                            {actionLoading ? (
                                <Loader2 size={22} className="animate-spin" />
                            ) : (
                                <div className="w-10 h-10 bg-status-error/10 rounded-xl flex items-center justify-center">
                                    <AlertTriangle size={22} strokeWidth={2.5} />
                                </div>
                            )}
                            Report Issue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ icon: Icon, label, value, brand, status }: any) => (
    <div className="flex flex-col gap-1 pr-2">
        <div className="flex items-center gap-2 text-neutral-soft">
            <Icon size={12} className={clsx(brand && "text-brand-700")} />
            <span className="text-[9px] font-black uppercase tracking-wider opacity-60">{label}</span>
        </div>
        <span className={clsx(
            "text-xs font-bold tracking-tight",
            status === 'error' ? "text-status-error" : status === 'success' ? "text-status-success" : "text-neutral-main"
        )}>{value}</span>
    </div>
);

export default ItemDetail;
