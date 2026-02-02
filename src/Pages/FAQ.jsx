import React, { useState } from 'react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleQuestion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqCategories = [
        {
            title: 'À propos de SGEE',
            questions: [
                {
                    q: 'Qu\'est-ce que SGEE ?',
                    a: 'SGEE (Système de Gestion des Enrôlements Étudiants) est une plateforme numérique développée pour faciliter le processus d\'inscription et d\'enrôlement des étudiants dans les établissements d\'enseignement supérieur au Cameroun. La plateforme permet aux candidats de s\'inscrire en ligne, de déposer leurs dossiers, de suivre leur statut d\'inscription et d\'accéder à toutes les informations nécessaires concernant les concours d\'entrée.',
                },
                {
                    q: 'Quels sont les avantages d\'utiliser SGEE ?',
                    a: 'SGEE offre plusieurs avantages :\n• Inscription en ligne simplifiée et rapide\n• Suivi en temps réel de votre dossier\n• Accès aux arrêtés de concours et informations officielles\n• Localisation des centres de dépôt et d\'examen\n• Réduction des déplacements et des files d\'attente\n• Sécurité et confidentialité de vos données\n• Interface intuitive et accessible 24/7',
                },
                {
                    q: 'Qui peut utiliser SGEE ?',
                    a: 'SGEE est destiné à tous les candidats souhaitant s\'inscrire aux concours d\'entrée dans les établissements d\'enseignement supérieur au Cameroun. Que vous soyez candidat pour la Première Année ou la Troisième Année, vous pouvez utiliser la plateforme pour gérer votre inscription.',
                },
            ],
        },
        {
            title: 'Inscription et Compte',
            questions: [
                {
                    q: 'Comment créer un compte sur SGEE ?',
                    a: 'Pour créer un compte :\n1. Cliquez sur "Connexion" en haut à droite\n2. Sélectionnez "Créer un compte" ou "S\'inscrire"\n3. Remplissez le formulaire avec vos informations personnelles (nom, email, téléphone)\n4. Choisissez un mot de passe sécurisé\n5. Validez votre inscription\n\nNote : Le numéro de quitus peut être ajouté lors de la création du compte ou lors de la connexion.',
                },
                {
                    q: 'Qu\'est-ce que le numéro de quitus et pourquoi est-il nécessaire ?',
                    a: 'Le numéro de quitus est un numéro unique délivré après le paiement des frais d\'examen à la banque. Il est obligatoire pour se connecter à la plateforme et commence par la lettre "Q" suivie de 5 chiffres (exemple : Q12345).\n\nImportant :\n• Un quitus ne peut être utilisé que par un seul candidat\n• Si vous avez perdu votre quitus, contactez le service client\n• Le quitus est unique et ne peut pas être partagé',
                },
                {
                    q: 'J\'ai oublié mon mot de passe, que faire ?',
                    a: 'Si vous avez oublié votre mot de passe :\n1. Cliquez sur "Connexion"\n2. Cliquez sur "Mot de passe oublié ?"\n3. Entrez votre adresse email\n4. Vous recevrez un lien de réinitialisation par email\n5. Suivez les instructions pour créer un nouveau mot de passe\n\nSi vous rencontrez des difficultés, contactez le support technique.',
                },
                {
                    q: 'Puis-je modifier mes informations personnelles après l\'inscription ?',
                    a: 'Oui, vous pouvez modifier certaines informations depuis votre tableau de bord. Cependant, certaines informations comme le numéro de quitus ou l\'email peuvent nécessiter une validation. Pour des modifications importantes, contactez le support.',
                },
            ],
        },
        {
            title: 'Processus d\'Enrôlement',
            questions: [
                {
                    q: 'Comment commencer mon enrôlement ?',
                    a: 'Pour commencer votre enrôlement :\n1. Connectez-vous à votre compte avec votre email, mot de passe et numéro de quitus\n2. Cliquez sur "Commencer" sur la page d\'accueil\n3. Sélectionnez le type de concours (Première Année ou Troisième Année)\n4. Remplissez le formulaire d\'enrôlement avec toutes les informations demandées\n5. Téléchargez les documents requis\n6. Soumettez votre dossier\n\nAssurez-vous d\'avoir tous les documents nécessaires avant de commencer.',
                },
                {
                    q: 'Quels documents sont nécessaires pour l\'enrôlement ?',
                    a: 'Les documents requis varient selon le type de concours, mais généralement vous aurez besoin de :\n• Copie du Baccalauréat ou diplôme équivalent\n• Relevé de notes du Baccalauréat\n• Acte de naissance\n• Photo d\'identité récente\n• Quitus de paiement (déjà utilisé pour la connexion)\n• Autres documents spécifiques selon l\'établissement\n\nConsultez les arrêtés de concours pour la liste complète des documents requis.',
                },
                {
                    q: 'Combien de temps prend le processus d\'enrôlement ?',
                    a: 'Le processus d\'enrôlement peut être complété en quelques heures si vous avez tous les documents prêts. Cependant, le traitement et la validation de votre dossier par l\'administration peuvent prendre plusieurs jours ouvrables. Vous pouvez suivre l\'état de votre dossier depuis votre tableau de bord.',
                },
                {
                    q: 'Puis-je sauvegarder mon formulaire d\'enrôlement et le compléter plus tard ?',
                    a: 'Oui, la plateforme permet de sauvegarder votre formulaire en cours de remplissage. Vous pouvez revenir plus tard pour compléter les informations manquantes avant la soumission finale.',
                },
            ],
        },
        {
            title: 'Paiement et Quitus',
            questions: [
                {
                    q: 'Comment payer les frais d\'examen ?',
                    a: 'Les frais d\'examen doivent être payés à la banque selon les modalités indiquées dans les arrêtés de concours. Les informations bancaires (nom de la banque, numéro de compte) sont disponibles dans chaque arrêté. Après le paiement, vous recevrez un numéro de quitus que vous devrez utiliser pour vous connecter à la plateforme.',
                },
                {
                    q: 'Quels sont les frais d\'inscription ?',
                    a: 'Les frais varient selon l\'établissement et le type de concours. Les montants exacts sont indiqués dans les arrêtés de concours disponibles sur la plateforme. Généralement, les frais comprennent :\n• Frais d\'inscription\n• Frais de traitement du dossier\n• Total des frais\n\nConsultez la section "Arrêtés du concours" pour les détails.',
                },
                {
                    q: 'Que faire si mon quitus n\'est pas accepté ?',
                    a: 'Si votre quitus n\'est pas accepté, vérifiez que :\n• Le format est correct (Q suivi de 5 chiffres)\n• Le quitus n\'a pas déjà été utilisé par un autre compte\n• Vous avez bien saisi le numéro\n\nSi le problème persiste, contactez le support avec une copie de votre quitus.',
                },
            ],
        },
        {
            title: 'Centres de Dépôt et d\'Examen',
            questions: [
                {
                    q: 'Où puis-je déposer mon dossier ?',
                    a: 'Vous pouvez consulter la liste des centres de dépôt sur la page "Nos sites". La plateforme vous permet de filtrer par région, ville et quartier pour trouver le centre le plus proche de chez vous. Chaque centre affiche ses horaires d\'ouverture et ses coordonnées de contact.',
                },
                {
                    q: 'Comment trouver un centre d\'examen ?',
                    a: 'Les centres d\'examen sont également listés sur la page "Nos sites". Vous pouvez utiliser la carte interactive pour visualiser l\'emplacement de chaque centre. Les informations incluent l\'adresse complète, la capacité et les coordonnées GPS.',
                },
                {
                    q: 'Puis-je choisir mon centre d\'examen ?',
                    a: 'Le choix du centre d\'examen dépend des règles de chaque établissement. Certains établissements permettent de choisir, d\'autres assignent automatiquement. Consultez les arrêtés de concours pour plus d\'informations.',
                },
            ],
        },
        {
            title: 'Arrêtés et Informations',
            questions: [
                {
                    q: 'Où puis-je consulter les arrêtés de concours ?',
                    a: 'Les arrêtés de concours officiels sont disponibles dans la section "Arrêtés du concours". Vous pouvez les filtrer par type (Première Année, Troisième Année) et par catégorie (Université, Grande École). Chaque arrêté peut être lu en ligne, téléchargé ou visualisé en PDF.',
                },
                {
                    q: 'Les arrêtés sont-ils officiels ?',
                    a: 'Oui, tous les arrêtés publiés sur la plateforme sont des documents officiels émanant des établissements d\'enseignement supérieur camerounais. Ils sont téléchargés directement depuis les sources officielles.',
                },
                {
                    q: 'Comment être informé des nouvelles dates et arrêtés ?',
                    a: 'Nous vous recommandons de consulter régulièrement la plateforme pour les mises à jour. Les nouveaux arrêtés sont ajoutés dès leur publication officielle. Vous pouvez également suivre les réseaux sociaux des établissements concernés.',
                },
            ],
        },
        {
            title: 'Problèmes Techniques',
            questions: [
                {
                    q: 'La plateforme ne charge pas ou est lente, que faire ?',
                    a: 'Si vous rencontrez des problèmes de chargement :\n• Vérifiez votre connexion internet\n• Actualisez la page (F5)\n• Videz le cache de votre navigateur\n• Essayez un autre navigateur (Chrome, Firefox, Edge)\n• Désactivez temporairement les extensions de navigateur\n\nSi le problème persiste, contactez le support technique.',
                },
                {
                    q: 'Je ne peux pas télécharger mes documents, que faire ?',
                    a: 'Assurez-vous que :\n• Les fichiers sont aux formats acceptés (PDF, JPG, PNG)\n• La taille des fichiers ne dépasse pas la limite (généralement 5MB)\n• Votre connexion internet est stable\n• Votre navigateur est à jour\n\nSi le problème persiste, essayez de compresser vos images ou contactez le support.',
                },
                {
                    q: 'Mon compte est bloqué, que faire ?',
                    a: 'Si votre compte est bloqué, cela peut être dû à :\n• Trop de tentatives de connexion échouées\n• Suspension par l\'administration\n• Problème technique\n\nContactez immédiatement le support avec votre email et numéro de quitus pour débloquer votre compte.',
                },
            ],
        },
        {
            title: 'Sécurité et Confidentialité',
            questions: [
                {
                    q: 'Mes données sont-elles sécurisées ?',
                    a: 'Oui, SGEE utilise des protocoles de sécurité avancés pour protéger vos données personnelles. Toutes les communications sont cryptées et vos informations sont stockées de manière sécurisée. Nous ne partageons jamais vos données avec des tiers sans votre consentement.',
                },
                {
                    q: 'Qui a accès à mes informations ?',
                    a: 'Vos informations sont accessibles uniquement à :\n• Vous-même (via votre compte)\n• L\'administration de l\'établissement pour le traitement de votre dossier\n• Le personnel autorisé de SGEE pour le support technique\n\nTous les accès sont tracés et sécurisés.',
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Questions Fréquentes (FAQ)
                    </h1>
                    <p className="text-xl text-gray-600">
                        Trouvez des réponses aux questions les plus courantes sur SGEE
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-indigo-900 mb-2">
                        Bienvenue sur SGEE
                    </h2>
                    <p className="text-indigo-800">
                        SGEE (Système de Gestion des Enrôlements Étudiants) est votre plateforme numérique 
                        pour gérer facilement votre inscription aux concours d'entrée dans les établissements 
                        d'enseignement supérieur au Cameroun. Cette FAQ répond aux questions les plus fréquentes 
                        pour vous aider à utiliser la plateforme efficacement.
                    </p>
                </div>

                {/* FAQ par catégorie */}
                <div className="space-y-8">
                    {faqCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-indigo-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white">
                                    {category.title}
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {category.questions.map((item, itemIndex) => {
                                    const index = `${categoryIndex}-${itemIndex}`;
                                    const isOpen = openIndex === index;
                                    
                                    return (
                                        <div key={itemIndex} className="border-b border-gray-200 last:border-b-0">
                                            <button
                                                onClick={() => toggleQuestion(index)}
                                                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900 pr-4">
                                                    {item.q}
                                                </span>
                                                <svg
                                                    className={`flex-shrink-0 h-5 w-5 text-gray-500 transition-transform ${
                                                        isOpen ? 'transform rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 py-4 bg-gray-50">
                                                    <p className="text-gray-700 whitespace-pre-line">
                                                        {item.a}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

