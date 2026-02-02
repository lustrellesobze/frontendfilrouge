import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function ProgramManagerLayout() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/auth/login');
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col fixed h-screen">
                <div className="p-4 border-b border-indigo-800">
                    <h1 className="text-xl font-bold">SGEE</h1>
                    <p className="text-xs text-indigo-200 mt-1">Responsable de filière</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <Link
                        to="/program-manager/dashboard"
                        className={`block px-4 py-3 hover:bg-indigo-800 transition ${
                            isActive('/program-manager/dashboard') ? 'bg-indigo-700' : ''
                        }`}
                    >
                        📊 Tableau de bord
                    </Link>
                    <Link
                        to="/program-manager/enrollments"
                        className={`block px-4 py-3 hover:bg-indigo-800 transition ${
                            isActive('/program-manager/enrollments') ? 'bg-indigo-700' : ''
                        }`}
                    >
                        📋 Candidatures
                    </Link>
                    <Link
                        to="/program-manager/reports"
                        className={`block px-4 py-3 hover:bg-indigo-800 transition ${
                            isActive('/program-manager/reports') ? 'bg-indigo-700' : ''
                        }`}
                    >
                        📈 Rapports
                    </Link>
                    <Link
                        to="/program-manager/profile"
                        className={`block px-4 py-3 hover:bg-indigo-800 transition ${
                            isActive('/program-manager/profile') ? 'bg-indigo-700' : ''
                        }`}
                    >
                        👤 Mon profil
                    </Link>
                </nav>

                <div className="border-t border-indigo-800 p-4">
                    <p className="text-sm text-indigo-200 truncate px-2">👤 {user?.name}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition text-sm"
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-64">
                <Outlet />
            </main>
        </div>
    );
}
