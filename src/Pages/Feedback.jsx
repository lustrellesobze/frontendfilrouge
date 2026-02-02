import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Feedback() {
    const { user } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        type: 'general',
        subject: '',
        message: '',
        rating: 5,
    });
    const [submitting, setSubmitting] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        try {
            setLoading(true);
            // Simuler le chargement des feedbacks précédents
            // TODO: Implémenter l'endpoint backend pour récupérer les feedbacks
            setFeedbacks([]);
        } catch (error) {
            console.error('Error loading feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.subject.trim() || !formData.message.trim()) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        try {
            setSubmitting(true);
            
            // TODO: Implémenter l'endpoint backend pour envoyer le feedback
            // await api.post('/feedback', formData);
            
            // Simulation pour l'instant
            toast.success('Merci pour votre feedback ! Nous prenons en compte vos remarques.');
            
            // Réinitialiser le formulaire
            setFormData({
                type: 'general',
                subject: '',
                message: '',
                rating: 5,
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Erreur lors de l\'envoi du feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">FeedBack</h1>
                <p className="text-gray-600">
                    Partagez vos remarques, suggestions ou signalements pour nous aider à améliorer le service.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire de feedback */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Envoyer un FeedBack
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type de feedback */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type de feedback
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="general">Commentaire général</option>
                                    <option value="bug">Signalement de bug</option>
                                    <option value="suggestion">Suggestion d'amélioration</option>
                                    <option value="complaint">Réclamation</option>
                                    <option value="praise">Félicitation</option>
                                </select>
                            </div>

                            {/* Note / Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note globale (1-5)
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating })}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${
                                                formData.rating >= rating
                                                    ? 'bg-yellow-400 text-yellow-900'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sujet */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sujet <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Résumé de votre feedback"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Décrivez votre feedback en détail..."
                                />
                            </div>

                            {/* Bouton de soumission */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {submitting ? 'Envoi en cours...' : 'Envoyer le FeedBack'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Informations */}
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">💡 Comment bien formuler un feedback ?</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Soyez précis et concret</li>
                            <li>Expliquez le problème ou la suggestion</li>
                            <li>Indiquez ce qui vous ferait plaisir</li>
                        </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-2">📞 Besoin d'aide urgente ?</h3>
                        <p className="text-sm text-green-800">
                            Pour une assistance immédiate, utilisez la chatbox ou contactez le support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
