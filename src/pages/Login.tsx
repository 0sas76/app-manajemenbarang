import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Fingerprint, Mail, Lock, User, Building2, Loader2, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, login, register } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');

    // Redirect if already logged in
    React.useEffect(() => {
        if (user && !authLoading) {
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name.trim()) {
                    throw new Error('Nama harus diisi');
                }
                await register(email, password, name, department || 'Umum', role);
            }
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Auth error:', err);
            if (err.code === 'auth/invalid-email') setError('Format email tidak valid');
            else if (err.code === 'auth/user-not-found') setError('Akun tidak ditemukan');
            else if (err.code === 'auth/wrong-password') setError('Password salah');
            else if (err.code === 'auth/email-already-in-use') setError('Email sudah terdaftar');
            else if (err.code === 'auth/weak-password') setError('Password minimal 6 karakter');
            else if (err.code === 'auth/invalid-credential') setError('Email atau password salah');
            else setError(err.message || 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-vh-screen bg-surface-50">
                <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-6 pb-24 bg-surface-50 relative overflow-y-auto no-scrollbar">

            <div className="w-full max-w-sm space-y-8 animate-fade-in mt-12 mb-8">
                {/* Logo Section */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-white shadow-xl rounded-2xl mx-auto flex items-center justify-center mb-6 border border-surface-200">
                        <Fingerprint size={32} className="text-brand-teal" />
                    </div>
                    <h1 className="text-3xl font-black text-brand-teal">
                        Asset<span className="text-brand-orange">Manager</span>
                    </h1>
                    <p className="text-sm font-medium text-neutral-soft mt-2">Kelola aset inventaris dengan mudah.</p>
                </div>

                {/* Tabs */}
                <div className="bg-surface-100 p-1 rounded-2xl flex border border-surface-200">
                    <button
                        onClick={() => { setIsLogin(true); setError(null); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-brand-teal shadow-sm' : 'text-neutral-soft'}`}
                    >
                        Masuk
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(null); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-brand-teal shadow-sm' : 'text-neutral-soft'}`}
                    >
                        Daftar
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 animate-shake">
                        <AlertCircle size={18} />
                        <span className="text-sm font-bold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-soft ml-2">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-soft" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama"
                                    className="input-modern pl-12"
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-soft ml-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-soft" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="input-modern pl-12"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-soft ml-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-soft" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                className="input-modern pl-12"
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-soft ml-2">Departemen</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['IT', 'Humas', 'SDM', 'Umum'].map(dept => (
                                        <button
                                            key={dept}
                                            type="button"
                                            onClick={() => setDepartment(dept)}
                                            className={`py-2 px-3 rounded-xl border-2 text-[10px] font-bold transition-all ${department === dept ? 'border-brand-teal bg-brand-50 text-brand-teal' : 'border-surface-200 bg-white text-neutral-soft'}`}
                                        >
                                            {dept}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-soft ml-2">Tipe Akun</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('user')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-center ${role === 'user' ? 'border-brand-teal bg-brand-50 text-brand-teal' : 'border-surface-200 bg-white text-neutral-soft'}`}
                                    >
                                        <User className="mx-auto mb-1" size={24} />
                                        <span className="block text-xs font-bold">User</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('admin')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-center ${role === 'admin' ? 'border-brand-teal bg-brand-50 text-brand-teal' : 'border-surface-200 bg-white text-neutral-soft'}`}
                                    >
                                        <Building2 className="mx-auto mb-1" size={24} />
                                        <span className="block text-xs font-bold">Admin</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary py-4 mt-6"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Masuk Sekarang' : 'Daftar Akun')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
