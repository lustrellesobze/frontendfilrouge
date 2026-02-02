import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Bande verte en haut avec "Espace Candidat National" */}
            <div className="bg-green-600 text-white text-center py-2">
                <span className="text-sm font-medium">Espace Candidat National</span>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            {/* Logo S SGEE avec carré violet */}
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">S</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">SGEE</span>
                            </Link>
                            <div className="hidden md:flex space-x-6">
                                <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                                    Accueil
                                </Link>
                                <Link to="/sites" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                                    Nos sites
                                </Link>
                                <Link to="/exams" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                                    Nos anciennes épreuves
                                </Link>
                                <Link to="/faq" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                                    FAQ
                                </Link>
                                <Link to="/contact" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                                    Contact
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {!isAuthenticated && (
                                <>
                                    <Link
                                        to="/auth/login"
                                        className="px-4 py-2 bg-white text-green-600 border border-green-600 rounded-md text-sm font-medium hover:bg-green-50 transition-colors whitespace-nowrap"
                                    >
                                        Se connecter
                                    </Link>
                                    <Link
                                        to="/auth/register"
                                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                                    >
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenu principal centré */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
