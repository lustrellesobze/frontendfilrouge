import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../store/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

const isProgramManager = (user) =>
    user?.roles?.some((r) => (typeof r === 'object' && r?.slug === 'responsable_filiere') || r === 'responsable_filiere');

const uploadsBase = () => {
    const base = import.meta.env.VITE_API_URL || '';
    if (base.startsWith('http')) return base.replace(/\/api\/?$/, '');
    return '';
};

export default function Profile() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        phone: user?.phone || '',
        email: user?.email || '',
        numero_responsable: user?.numero_responsable ?? '',
    });

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                phone: user.phone || '',
                email: user.email || '',
                numero_responsable: user.numero_responsable ?? '',
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { phone: formData.phone, email: formData.email };
            if (isProgramManager(user)) payload.numero_responsable = formData.numero_responsable || null;
            await api.put('/auth/profile', payload);
            await dispatch(getCurrentUser());
            toast.success('Profil mis à jour avec succès');
        } catch (error) {
            // Ne pas afficher un 2e toast si l'intercepteur a déjà affiché "Impossible de contacter le serveur"
            if (error.response) {
                const msg = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Veuillez choisir une image (JPEG, PNG, GIF, WebP).');
            return;
        }
        try {
            setAvatarLoading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            await api.post('/auth/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await dispatch(getCurrentUser());
            toast.success('Photo de profil mise à jour');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de l\'upload de la photo');
        } finally {
            setAvatarLoading(false);
        }
    };

    const avatarUrl = user?.avatar_path
        ? `${uploadsBase() || ''}/uploads/${user.avatar_path}`.replace(/\/+/g, '/')
        : null;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Mon Profil</h1>
                <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>

            {/* Photo de profil (tous les utilisateurs) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo de profil</h2>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl text-gray-500">👤</span>
                        )}
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                        >
                            {avatarLoading ? 'Envoi...' : 'Changer la photo'}
                        </button>
                        <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF ou WebP. Max 2 Mo.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                        <input
                            type="text"
                            value={user?.name || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Le nom ne peut pas être modifié. Contactez l'administration pour toute modification.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="votre@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="+237 6XX XXX XXX"
                        />
                    </div>

                    {isProgramManager(user) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numéro responsable (ex. RF-001)
                            </label>
                            <input
                                type="text"
                                value={formData.numero_responsable}
                                onChange={(e) => setFormData({ ...formData, numero_responsable: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="RF-001"
                            />
                        </div>
                    )}

                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({
                                    phone: user?.phone || '',
                                    email: user?.email || '',
                                    numero_responsable: user?.numero_responsable ?? '',
                                })
                            }
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
