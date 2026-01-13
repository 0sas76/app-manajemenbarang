import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Camera, Zap, ShieldAlert, RefreshCw, ScanLine } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

const ScanPage: React.FC = () => {
    const navigate = useNavigate();
    const [manualId, setManualId] = useState('');
    const [error, setError] = useState('');
    const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [isScanning, setIsScanning] = useState(false);
    const [isNative, setIsNative] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
    const hasInitializedRef = useRef(false);

    // Check if running on native platform
    useEffect(() => {
        setIsNative(Capacitor.isNativePlatform());
    }, []);

    // Request camera permission
    useEffect(() => {
        const requestCameraPermission = async () => {
            try {
                if (isNative) {
                    const { camera } = await BarcodeScanner.checkPermissions();
                    if (camera === 'granted') {
                        setPermissionStatus('granted');
                    } else if (camera === 'denied') {
                        setPermissionStatus('denied');
                        setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan perangkat Anda.');
                    } else {
                        const result = await BarcodeScanner.requestPermissions();
                        if (result.camera === 'granted') {
                            setPermissionStatus('granted');
                        } else {
                            setPermissionStatus('denied');
                            setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan perangkat Anda.');
                        }
                    }
                } else {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(track => track.stop());
                    setPermissionStatus('granted');
                }
            } catch (err) {
                console.error('Camera permission error:', err);
                setPermissionStatus('denied');
                setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan perangkat Anda.');
            }
        };

        const timer = setTimeout(requestCameraPermission, 100);
        return () => clearTimeout(timer);
    }, [isNative]);

    // Initialize scanner after permission is granted (web only)
    useEffect(() => {
        if (permissionStatus !== 'granted' || hasInitializedRef.current || isNative) {
            return;
        }

        const initScanner = async () => {
            hasInitializedRef.current = true;
            await startWebScan();
        };

        const timer = setTimeout(initScanner, 200);
        return () => clearTimeout(timer);
    }, [permissionStatus, isNative]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrcodeRef.current) {
                html5QrcodeRef.current.stop().catch(console.error);
            }
        };
    }, []);

    // Native scan using MLKit's scan() method - opens a full-screen native scanner
    const startNativeScan = async () => {
        if (isScanning) return;

        try {
            setIsScanning(true);
            setError('');

            // Use the scan() method which opens a native full-screen scanner dialog
            const { barcodes } = await BarcodeScanner.scan({
                formats: [BarcodeFormat.QrCode],
            });

            setIsScanning(false);

            if (barcodes && barcodes.length > 0) {
                const barcode = barcodes[0];
                handleScan(barcode.rawValue || '');
            }
        } catch (err: any) {
            console.error('Native scan error:', err);
            setIsScanning(false);

            // Check if user cancelled
            if (err.message?.includes('canceled') || err.message?.includes('cancelled')) {
                // User cancelled, don't show error
                return;
            }

            setError('Gagal memulai scanner. Silakan coba lagi.');
        }
    };

    // Start web-based scanning
    const startWebScan = async () => {
        try {
            const readerElement = document.getElementById('reader');
            if (!readerElement) {
                console.error('Reader element not found');
                return;
            }

            setIsScanning(true);

            html5QrcodeRef.current = new Html5Qrcode("reader");

            await html5QrcodeRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 220, height: 220 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    handleScan(decodedText);
                },
                () => { }
            );
        } catch (err) {
            console.error('Web scan error:', err);
            setError('Gagal memulai scanner. Silakan coba lagi.');
            setIsScanning(false);
        }
    };

    const handleScan = async (id: string) => {
        if (!id || isLoading) return;

        // Stop web scanner if running
        if (html5QrcodeRef.current) {
            try {
                await html5QrcodeRef.current.stop();
                html5QrcodeRef.current = null;
            } catch (e) {
                console.error(e);
            }
        }
        setIsScanning(false);
        setIsLoading(true);

        try {
            // Use FirestoreService to get item from Firebase
            const item = await FirestoreService.getItem(id);

            if (item) {
                navigate(`/item/${id}`);
            } else {
                setError(`Asset '${id}' tidak ditemukan dalam sistem.`);
            }
        } catch (err) {
            console.error('Error fetching item:', err);
            setError(`Gagal mencari asset. Periksa koneksi internet Anda.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualId) handleScan(manualId);
    };

    const retryPermission = () => {
        setPermissionStatus('pending');
        setError('');
        hasInitializedRef.current = false;
        window.location.reload();
    };

    return (
        <div className="h-full flex flex-col bg-neutral-main text-white">
            {/* Immersive Dark Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-neutral-main/80 backdrop-blur-md sticky top-0 z-20">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Scanner</span>
                    <span className="font-extrabold text-lg tracking-tight">Active Lens</span>
                </div>
                <div className="w-10 h-10" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">

                {/* Permission Pending State */}
                {permissionStatus === 'pending' && (
                    <div className="w-full max-w-[300px] aspect-square relative flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-white/60 text-sm font-medium text-center">Meminta akses kamera...</p>
                    </div>
                )}

                {/* Permission Denied State */}
                {permissionStatus === 'denied' && (
                    <div className="w-full max-w-sm flex flex-col items-center justify-center gap-6 p-8">
                        <div className="w-20 h-20 rounded-full bg-status-error/20 flex items-center justify-center">
                            <ShieldAlert size={40} className="text-status-error" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-white">Akses Kamera Diperlukan</h3>
                            <p className="text-white/60 text-sm">Untuk menggunakan scanner QR, silakan izinkan akses kamera di pengaturan perangkat Anda.</p>
                        </div>
                        <button
                            onClick={retryPermission}
                            className="flex items-center gap-2 bg-brand-700 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                        >
                            <RefreshCw size={16} />
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Scanner Container */}
                {permissionStatus === 'granted' && (
                    <>
                        {/* Native: Show scan button */}
                        {isNative ? (
                            <div className="w-full max-w-[300px] flex flex-col items-center gap-8">
                                <div className="w-full aspect-square relative group">
                                    <div className="absolute -inset-4 bg-brand-700/20 blur-2xl rounded-full opacity-50" />

                                    {/* Corner Accents */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-500 rounded-tl-2xl z-10" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-500 rounded-tr-2xl z-10" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-500 rounded-bl-2xl z-10" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-500 rounded-br-2xl z-10" />

                                    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 flex flex-col items-center justify-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-brand-500/20 flex items-center justify-center">
                                            <ScanLine size={48} className="text-brand-400" />
                                        </div>
                                        <div className="text-center px-4">
                                            <p className="text-white/80 text-sm font-medium">Tekan tombol untuk memulai scanner</p>
                                            <p className="text-white/40 text-xs mt-1">Scanner akan menggunakan kamera belakang</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={startNativeScan}
                                    disabled={isScanning || isLoading}
                                    className="w-full flex items-center justify-center gap-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-700 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-elevated transition-all active:scale-95"
                                >
                                    {isScanning || isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {isLoading ? 'Mencari...' : 'Scanning...'}
                                        </>
                                    ) : (
                                        <>
                                            <Camera size={20} />
                                            Mulai Scan QR
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            /* Web: Show camera preview */
                            <div className="w-full max-w-[300px] aspect-square relative group">
                                <div className="absolute -inset-4 bg-brand-700/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />

                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-500 rounded-tl-2xl z-10" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-500 rounded-tr-2xl z-10" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-500 rounded-bl-2xl z-10" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-500 rounded-br-2xl z-10" />

                                <div id="reader" className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-black">
                                    {!isScanning && (
                                        <div className="absolute inset-0 bg-neutral-main/80 flex flex-col items-center justify-center gap-4 z-10">
                                            <Camera size={48} className="text-white/30 animate-pulse" />
                                            <p className="text-white/50 text-sm">Memulai kamera...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="absolute -bottom-10 left-0 w-full text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-400 flex items-center justify-center gap-2">
                                        <Zap size={10} /> {isScanning ? 'Scanning aktif...' : 'Menunggu kamera...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {error && (
                    <div className="w-full max-w-sm p-4 bg-status-error_bg text-status-error rounded-2xl border border-status-error/20 text-xs font-bold text-center animate-slide-up">
                        {error}
                    </div>
                )}

                <div className="w-full max-w-sm pt-4">
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink-0 mx-6 text-white/20 text-[10px] font-black uppercase tracking-widest">Manual Entry</span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <form onSubmit={handleManualSubmit} className="mt-4 flex flex-col gap-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="Input ID Manually..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-white/20"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-brand-700 hover:bg-brand-600 disabled:bg-brand-800 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-elevated transition-all active:scale-95"
                        >
                            {isLoading ? 'Mencari...' : 'Verify Identification'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScanPage;
