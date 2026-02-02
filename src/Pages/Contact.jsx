import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation basique
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Veuillez entrer une adresse email valide');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/contact', formData);
            
            if (response.data.success) {
                toast.success(response.data.message || 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                });
            } else {
                toast.error(response.data.message || 'Une erreur est survenue. Veuillez réessayer.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            const errorMessage = error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Contactez-nous
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Vous avez des questions ? Nous sommes là pour vous aider. N'hésitez pas à nous contacter.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Informations de contact */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Informations de contact
                            </h2>
                            
                            <div className="space-y-6">
                                {/* Email */}
                                <div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-semibold text-gray-900">Email</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <a href="mailto:contact@sgee.cm" className="text-indigo-600 hover:text-indigo-800">
                                                    contact@sgee.cm
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-semibold text-gray-900">Téléphone</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <a href="tel:+237222123456" className="text-indigo-600 hover:text-indigo-800">
                                                    +237 222 12 34 56
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Adresse */}
                                <div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-semibold text-gray-900">Adresse</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Yaoundé, Cameroun<br />
                                                BP 1234
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Horaires */}
                                <div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-sm font-semibold text-gray-900">Horaires</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Lundi - Vendredi: 8h00 - 17h00<br />
                                                Samedi: 8h00 - 13h00
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de contact */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Envoyez-nous un message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nom */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Votre nom"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="votre.email@exemple.com"
                                    />
                                </div>

                                {/* Sujet */}
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sujet <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Sélectionnez un sujet</option>
                                        <option value="inscription">Question sur l'inscription</option>
                                        <option value="paiement">Question sur le paiement</option>
                                        <option value="quitus">Question sur le quitus</option>
                                        <option value="examen">Question sur les examens</option>
                                        <option value="technique">Problème technique</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Votre message..."
                                    />
                                </div>

                                {/* Bouton d'envoi */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

