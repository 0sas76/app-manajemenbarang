import React, { useState, useRef, useEffect } from 'react';
import { FirestoreService } from '../../services/firestoreService';
import type { Item } from '../../types';
import { Trash2, Edit2, Plus, QrCode, Download, Search, Tag, Package, User, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import clsx from 'clsx';

const ItemManagement: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);
    const [showQr, setShowQr] = useState<Item | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const qrRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const fetchedItems = await FirestoreService.getItems();
        setItems(fetchedItems);
        setLoading(false);
    };

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.item_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem && editingItem.name && editingItem.item_id) {
            const newItem: Item = {
                item_id: editingItem.item_id,
                name: editingItem.name,
                category: editingItem.category || 'General',
                status: editingItem.status || 'Available',
                current_holder_id: editingItem.current_holder_id || null,
                current_holder_name: editingItem.current_holder_name || null,
                last_condition: editingItem.last_condition || 'Baik',
                last_updated: Date.now()
            };
            await FirestoreService.saveItem(newItem);
            setEditingItem(null);
            fetchItems();
        }
    };

    const handleDelete = async (itemId: string) => {
        if (window.confirm('Delete this item?')) {
            await FirestoreService.deleteItem(itemId);
            fetchItems();
        }
    };

    const downloadQr = () => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas && showQr) {
            const url = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = `QR-${showQr.item_id}.png`;
            link.href = url;
            link.click();
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
        <div className="space-y-6 animate-slide-up pb-10">
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tightest text-neutral-main">Asset Vault</h2>
                        <p className="text-sm font-semibold text-neutral-soft">{items.length} units listed</p>
                    </div>
                    <button
                        onClick={() => setEditingItem({ item_id: `ITM-${Date.now().toString().slice(-4)}`, status: 'Available', category: 'General' })}
                        className="w-12 h-12 bg-neutral-main text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 transition-colors shadow-premium active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-soft" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="input-modern pl-12 h-14 text-sm font-semibold shadow-subtle border-surface-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Modal - Modern Design */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-main/20 backdrop-blur-md animate-fade-in">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-modal border border-surface-200 animate-scale-in">
                        <h3 className="text-xl font-black tracking-tightest mb-8">Asset Details</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-soft ml-1">Identity Tag</label>
                                <input
                                    value={editingItem.item_id}
                                    onChange={e => setEditingItem({ ...editingItem, item_id: e.target.value })}
                                    className="input-modern"
                                    placeholder="ITM-00X"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-soft ml-1">Asset Description</label>
                                <input
                                    value={editingItem.name}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="input-modern"
                                    placeholder="Item Name"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-soft ml-1">Sector / Type</label>
                                <input
                                    value={editingItem.category}
                                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                                    className="input-modern"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 btn-secondary rounded-2xl">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary rounded-2xl">Commit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal - High-End Aesthetic */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-main/20 backdrop-blur-md animate-fade-in">
                    <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm shadow-modal text-center border border-surface-200 animate-scale-in">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-brand-50 text-brand-700 rounded-3xl flex items-center justify-center mb-4">
                                <Package size={32} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tightest text-neutral-main">{showQr.name}</h3>
                            <span className="text-xs font-bold text-neutral-soft uppercase tracking-widest mt-1">{showQr.item_id}</span>
                        </div>

                        <div ref={qrRef} className="flex justify-center p-8 bg-surface-50 border border-surface-200 rounded-[2.5rem] mb-10 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <QRCodeCanvas value={showQr.item_id} size={180} level={"H"} includeMargin={false} />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowQr(null)} className="flex-1 btn-secondary rounded-2xl">Dismiss</button>
                            <button onClick={downloadQr} className="flex-1 btn-primary rounded-2xl gap-2">
                                <Download size={18} /> Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid for Assets */}
            <div className="grid gap-4">
                {filteredItems.map(item => (
                    <div key={item.item_id} className="card-premium flex flex-col gap-4 group">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center text-neutral-soft border border-surface-200 group-hover:bg-brand-50 group-hover:text-brand-700 transition-all duration-300">
                                    <Tag size={24} />
                                </div>
                                <div className="flex flex-col pt-1">
                                    <h3 className="font-black text-lg text-neutral-main leading-none group-hover:text-brand-700 transition-colors tracking-tight">{item.name}</h3>
                                    <span className="text-[10px] font-bold text-neutral-soft uppercase tracking-wider mt-2 bg-surface-50 px-2 py-0.5 rounded-full border border-surface-200 w-fit">{item.category}</span>
                                </div>
                            </div>
                            <div className={clsx(
                                "text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-widest",
                                item.status === 'Available' ? "bg-status-success_bg text-status-success border-status-success/10" :
                                    item.status === 'Broken' ? "bg-status-error_bg text-status-error border-status-error/10" : "bg-status-info_bg text-status-info border-status-info/10"
                            )}>
                                {item.status}
                            </div>
                        </div>

                        {item.current_holder_name && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-brand-50/50 rounded-xl border border-brand-100/50">
                                <User size={12} className="text-brand-600" />
                                <span className="text-[10px] font-bold text-brand-800">Assigned to: {item.current_holder_name}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-surface-100 gap-2">
                            <button onClick={() => setShowQr(item)} className="h-10 px-4 bg-surface-50 text-neutral-soft hover:bg-neutral-main hover:text-white rounded-xl transition-all duration-300 text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                                <QrCode size={14} className="group-hover/btn:rotate-12 transition-transform" /> QR Code
                            </button>
                            <div className="flex gap-1">
                                <button onClick={() => setEditingItem(item)} className="p-2.5 text-neutral-soft hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-all">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.item_id)} className="p-2.5 text-neutral-soft hover:text-status-error hover:bg-status-error_bg rounded-xl transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredItems.length === 0 && (
                    <div className="text-center py-20 text-neutral-soft font-bold opacity-30 uppercase tracking-widest text-xs">No assets found</div>
                )}
            </div>
        </div>
    );
};

export default ItemManagement;
