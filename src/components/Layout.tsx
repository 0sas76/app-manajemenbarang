import React from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, QrCode, Box, User, LogOut, Loader2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    const { userProfile, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-vh-screen bg-surface-50">
                <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
            </div>
        );
    }

    if (!userProfile) return <Outlet />;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const NavItem = ({ to, tab, icon: Icon, label }: { to: string, tab?: string, icon: any, label: string }) => {
        const isPathActive = location.pathname === to;
        const isTabActive = tab ? activeTab === tab : true;
        const isActive = isPathActive && isTabActive;

        const handleClick = () => {
            if (tab) {
                navigate(`${to}?tab=${tab}`);
            } else {
                navigate(to);
            }
        };

        return (
            <button
                onClick={handleClick}
                className={clsx(
                    "flex flex-col items-center justify-center py-2 px-1 relative transition-all duration-300",
                    isActive ? "text-brand-teal" : "text-neutral-soft hover:text-brand-sage"
                )}
            >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx(
                    "text-[9px] font-bold tracking-tight uppercase mt-1",
                    isActive ? "opacity-100" : "opacity-60"
                )}>{label}</span>
                {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-brand-teal rounded-full" />
                )}
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full bg-surface-50 text-neutral-main">
            {/* Header */}
            <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-surface-200 sticky top-0 z-30">
                <div className="flex flex-col">
                    <h1 className="text-lg font-black text-brand-teal leading-none">
                        Asset<span className="text-brand-orange">Manager</span>
                    </h1>
                    <span className="text-[9px] text-brand-sand font-bold uppercase tracking-widest mt-1">{userProfile.role} mode</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center text-neutral-soft hover:text-status-error transition-colors"
                >
                    <LogOut size={18} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <div className="max-w-2xl mx-auto p-4">
                    <Outlet />
                </div>
            </main>

            {/* Role-Based Bottom Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-40">
                <nav className="h-20 bg-white border border-surface-200 shadow-xl rounded-[2rem] flex justify-around items-center px-4">
                    {userProfile.role === 'admin' ? (
                        <>
                            <NavItem to="/dashboard" tab="dashboard" icon={LayoutDashboard} label="Meta" />
                            <NavItem to="/dashboard" tab="users" icon={User} label="Team" />

                            <button
                                onClick={() => navigate('/scan')}
                                className="w-14 h-14 rounded-2xl bg-brand-teal text-white shadow-lg shadow-brand-teal/20 
                                         flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                            >
                                <QrCode size={24} />
                            </button>

                            <NavItem to="/dashboard" tab="items" icon={Box} label="Stock" />
                            <NavItem to="/profile" icon={User} label="Me" />
                        </>
                    ) : (
                        <>
                            <NavItem to="/dashboard" icon={Home} label="Home" />

                            <button
                                onClick={() => navigate('/scan')}
                                className="w-14 h-14 rounded-2xl bg-brand-teal text-white shadow-lg shadow-brand-teal/20 
                                         flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                            >
                                <QrCode size={24} />
                            </button>

                            <NavItem to="/profile" icon={User} label="Account" />
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
};
