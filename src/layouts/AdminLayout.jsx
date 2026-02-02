import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export default function AdminLayout({ children }) {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState({
        gestionFlux: true,
        structure: false,
        centres: false,
    });

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/auth/login');
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-screen">
                {/* Logo */}
                <div className="p-4 border-b border-blue-800">
                    <h1 className="text-xl font-bold">E-Concours</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {/* GESTION DES FLUX */}
                    <div>
                        <button
                            onClick={() => toggleSection('gestionFlux')}
                            className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-blue-800 transition"
                        >
                            <span className="font-semibold">GESTION DES FLUX</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${expandedSections.gestionFlux ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedSections.gestionFlux && (
                            <div className="bg-blue-800">
                                <Link
                                    to="/admin/enrollments"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/enrollments') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Candidats
                                </Link>
                                <Link
                                    to="/admin/quitus"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/quitus') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Quitus
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* PARAMÈTRES DE L'APPLICATION */}
                    <Link
                        to="/admin/parametres"
                        className={`block w-full px-4 py-2 text-left hover:bg-blue-800 transition font-semibold ${isActive('/admin/parametres') || isActive('/admin/dossier-settings') ? 'bg-blue-800' : ''}`}
                    >
                        Paramètres de l&apos;application
                    </Link>

                    {/* STRUCTURE ACADÉMIQUE */}
                    <div>
                        <button
                            onClick={() => toggleSection('structure')}
                            className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-blue-800 transition"
                        >
                            <span className="font-semibold">STRUCTURE ACADÉMIQUE</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${expandedSections.structure ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedSections.structure && (
                            <div className="bg-blue-800">
                                <Link
                                    to="/admin/ecoles"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/ecoles') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Écoles
                                </Link>
                                <Link
                                    to="/admin/concours"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/concours') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Concours
                                </Link>
                                <Link
                                    to="/admin/sessions"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/sessions') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Sessions
                                </Link>
                                <Link
                                    to="/admin/program-managers"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${isActive('/admin/program-managers') ? 'bg-blue-600' : ''}`}
                                >
                                    Responsables de filière
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* CENTRES & LOGISTIQUE */}
                    <div>
                        <button
                            onClick={() => toggleSection('centres')}
                            className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-blue-800 transition"
                        >
                            <span className="font-semibold">CENTRES & LOGISTIQUE</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${expandedSections.centres ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedSections.centres && (
                            <div className="bg-blue-800">
                                <Link
                                    to="/admin/centres"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/centres') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Centres (vue d'ensemble)
                                </Link>
                                <Link
                                    to="/admin/exam-centers"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/exam-centers') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Centres d'examen
                                </Link>
                                <Link
                                    to="/admin/depot-centers"
                                    className={`block px-8 py-2 hover:bg-blue-700 transition ${
                                        isActive('/admin/depot-centers') ? 'bg-blue-600' : ''
                                    }`}
                                >
                                    Centres de dépôt
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* RAPPORTS */}
                    <Link
                        to="/admin/reports"
                        className={`block w-full px-4 py-2 text-left hover:bg-blue-800 transition font-semibold ${isActive('/admin/reports') ? 'bg-blue-800' : ''}`}
                    >
                        Rapports
                    </Link>
                </nav>

                {/* Footer Sidebar */}
                <div className="border-t border-blue-800 p-4 space-y-2">
                    <Link
                        to="/admin/profile"
                        className="block px-4 py-2 hover:bg-blue-800 rounded transition"
                    >
                        Mon Profil
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition text-left"
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <Outlet />
            </main>
        </div>
    );
}
