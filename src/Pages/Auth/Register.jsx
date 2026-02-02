import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register, logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Register() {
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        email: '',
        phone: '',
        quitus_code: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        // Valider le format du quitus (Q + 5 chiffres)
        if (!formData.quitus_code) {
            toast.error('Le code quitus est obligatoire');
            return;
        }

        // Normaliser le quitus : s'assurer qu'il commence par Q et a 5 chiffres
        let quitusNumber = formData.quitus_code.toUpperCase().trim();
        
        // Si pas de Q, ajouter Q
        if (!quitusNumber.startsWith('Q')) {
            quitusNumber = 'Q' + quitusNumber.replace(/\D/g, '');
        }
        
        // Extraire les chiffres après Q
        const digits = quitusNumber.substring(1).replace(/\D/g, '');
        
        // Valider le format final
        if (digits.length !== 5) {
            toast.error('Le code quitus doit être au format Q12345 (Q suivi de 5 chiffres)');
            return;
        }
        
        quitusNumber = 'Q' + digits.padStart(5, '0');

        // Combiner nom et prénom pour l'API
        const name = `${formData.first_name} ${formData.last_name}`.trim();

        try {
            const result = await dispatch(register({
                name,
                email: formData.email,
                phone: formData.phone,
                quitus_number: quitusNumber,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            })).unwrap();
            
            // IMPORTANT: Déconnecter l'utilisateur après l'inscription
            // pour qu'il doive se connecter manuellement
            // Utiliser l'action logout pour mettre à jour le store Redux
            await dispatch(logout());
            
            toast.success('Inscription réussie ! Veuillez vous connecter pour continuer.', {
                duration: 4000,
            });
            
            // Rediriger vers la page de connexion (pas directement au dashboard)
            navigate('/auth/login', { replace: true });
        } catch (err) {
            console.error('Erreur d\'inscription:', err);
            const errorMessage = typeof err === 'string' ? err : err?.message || 'Erreur lors de l\'inscription';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            {/* Icône et Titre */}
            <div className="text-center mb-8">
                {/* Icône verte avec deux personnes */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <svg className="w-6 h-6 text-green-600 absolute ml-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Créer un compte
                </h2>
                <p className="text-sm text-gray-500">
                    Espace Candidat National
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Informations de connexion */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900">Informations de connexion</h3>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Académique *
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="Email@gmail.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="quitus_code" className="block text-sm font-medium text-gray-700 mb-1">
                            Code Quitus * <span className="text-gray-500 font-normal">(Q suivi de 5 chiffres)</span>
                        </label>
                        <input
                            id="quitus_code"
                            type="text"
                            required
                            maxLength={6}
                            value={formData.quitus_code}
                            onChange={(e) => {
                                let value = e.target.value.toUpperCase().trim();
                                
                                // Si l'utilisateur commence par autre chose que Q, forcer Q
                                if (value.length > 0 && !value.startsWith('Q')) {
                                    // Si c'est un chiffre, ajouter Q devant
                                    if (/^\d/.test(value)) {
                                        value = 'Q' + value.replace(/\D/g, '');
                                    } else {
                                        // Sinon, remplacer par Q
                                        value = 'Q' + value.replace(/[^0-9]/g, '');
                                    }
                                }
                                
                                // Si commence par Q, garder Q et ne garder que les chiffres après
                                if (value.startsWith('Q')) {
                                    const digits = value.substring(1).replace(/\D/g, '');
                                    // Limiter à 5 chiffres après le Q
                                    if (digits.length > 5) {
                                        value = 'Q' + digits.substring(0, 5);
                                    } else {
                                        value = 'Q' + digits;
                                    }
                                } else if (value.length > 0) {
                                    // Si pas de Q et qu'il y a du contenu, ajouter Q
                                    const digits = value.replace(/\D/g, '');
                                    value = 'Q' + digits.substring(0, 5);
                                }
                                
                                setFormData({ ...formData, quitus_code: value });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm text-center text-lg font-semibold tracking-widest uppercase"
                            placeholder="Q12345"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Entrez votre numéro de quitus : Q suivi de 5 chiffres (exemple : Q12345). Chaque quitus ne peut être utilisé qu'une seule fois.
                        </p>
                        {formData.quitus_code && !/^Q\d{5}$/.test(formData.quitus_code) && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                                ⚠️ Format invalide. Le quitus doit être au format Q12345 (Q suivi de 5 chiffres).
                            </p>
                        )}
                        {formData.quitus_code && /^Q\d{5}$/.test(formData.quitus_code) && (
                            <p className="mt-1 text-xs text-green-600 font-medium">
                                ✅ Format correct
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe *
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmation *
                        </label>
                        <input
                            id="password_confirmation"
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            required
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10"
                            placeholder="Retapez le mot de passe"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                        >
                            {showPasswordConfirmation ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Section Informations personnelles */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                    </div>

                    <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom *
                        </label>
                        <input
                            id="last_name"
                            type="text"
                            required
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="Mot de famille"
                        />
                    </div>

                    <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Prénom *
                        </label>
                        <input
                            id="first_name"
                            type="text"
                            required
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="Prénom(s)"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Téléphone *
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="+237 7XXX XXX XX"
                        />
                    </div>
                </div>

                {/* Bouton Créer mon compte */}
                <div className="pt-6">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                    >
                        Créer mon compte
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Lien Se connecter */}
                <div className="text-center pt-4">
                    <Link to="/auth/login" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                        Déjà inscrit ? Se connecter
                    </Link>
                </div>

                {/* Texte Portail Sécurisé */}
                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        Portail Sécurisé SGEE
                    </p>
                </div>
            </form>
        </div>
    );
}
