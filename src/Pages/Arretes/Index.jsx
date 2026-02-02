import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Données par défaut (fallback si l'API ne répond pas)
const arretesDataDefault = [
    {
        id: 1,
        title: 'Arrêté N° 001/2024 portant ouverture du concours d\'entrée en Première Année',
        institution: 'Université de Yaoundé I',
        type: 'Première Année',
        date: '2024-01-15',
        deadline_date: '2024-03-31',
        exam_date: '2024-05-15',
        results_date: '2024-06-30',
        registration_fee: 5000,
        processing_fee: 2000,
        total_fee: 7000,
        bank_name: 'Afriland First Bank',
        bank_account_number: '1000123456789012',
        content: `
            <p><strong>LE MINISTRE DE L'ENSEIGNEMENT SUPERIEUR</strong></p>
            <p>Vu la loi N° 005 du 16 avril 2001 portant orientation de l'enseignement supérieur au Cameroun ;</p>
            <p>Vu le décret N° 2018/367 du 20 juillet 2018 portant organisation administrative et académique de l'Université de Yaoundé I ;</p>
            <p>Arrête :</p>
            <p><strong>Article 1er :</strong> Il est ouvert un concours d'entrée en Première Année pour l'année académique 2024-2025.</p>
            <p><strong>Article 2 :</strong> Les candidats doivent être titulaires du Baccalauréat ou d'un diplôme équivalent.</p>
            <p><strong>Article 3 :</strong> Les inscriptions se font exclusivement en ligne sur la plateforme officielle.</p>
            <p><strong>Article 4 :</strong> Le présent arrêté entre en vigueur à compter de sa signature.</p>
        `,
        conditions: [
            'Être titulaire du Baccalauréat (toutes séries) ou d\'un diplôme équivalent',
            'Avoir effectué le paiement des frais de concours (7 000 FCFA)',
            'Déposer un dossier complet dans les délais impartis',
            'Avoir au moins 16 ans au 31 décembre de l\'année du concours',
        ],
        document_url: 'https://www.univ-yaounde1.cm/arretes/concours-2024.pdf',
        categories: ['Université', 'Première Année'],
    },
    {
        id: 2,
        title: 'Arrêté N° 002/2024 portant ouverture du concours d\'entrée en Troisième Année',
        institution: 'Université de Yaoundé I',
        type: 'Troisième Année',
        date: '2024-01-20',
        deadline_date: '2024-04-15',
        exam_date: '2024-06-01',
        results_date: '2024-07-15',
        registration_fee: 5000,
        processing_fee: 2000,
        total_fee: 7000,
        bank_name: 'Afriland First Bank',
        bank_account_number: '1000123456789012',
        content: `
            <p><strong>LE MINISTRE DE L'ENSEIGNEMENT SUPERIEUR</strong></p>
            <p>Vu la loi N° 005 du 16 avril 2001 portant orientation de l'enseignement supérieur au Cameroun ;</p>
            <p>Arrête :</p>
            <p><strong>Article 1er :</strong> Il est ouvert un concours d'entrée en Troisième Année pour l'année académique 2024-2025.</p>
            <p><strong>Article 2 :</strong> Les candidats doivent être titulaires d'un BTS, DUT, Licence 2 ou diplôme équivalent.</p>
            <p><strong>Article 3 :</strong> Les inscriptions se font exclusivement en ligne sur la plateforme officielle.</p>
            <p><strong>Article 4 :</strong> Le présent arrêté entre en vigueur à compter de sa signature.</p>
        `,
        conditions: [
            'Être titulaire d\'un BTS, DUT, Licence 2 ou diplôme équivalent',
            'Avoir effectué le paiement des frais de concours (7 000 FCFA)',
            'Déposer un dossier complet dans les délais impartis',
            'Avoir une moyenne générale minimale de 12/20',
        ],
        document_url: 'https://www.univ-yaounde1.cm/arretes/concours-3e-annee-2024.pdf',
        categories: ['Université', 'Troisième Année'],
    },
    {
        id: 3,
        title: 'Arrêté N° 003/2024 portant ouverture du concours d\'entrée à l\'École Normale Supérieure',
        institution: 'École Normale Supérieure de Yaoundé',
        type: 'Première Année',
        date: '2024-02-01',
        deadline_date: '2024-04-30',
        exam_date: '2024-06-20',
        results_date: '2024-08-01',
        registration_fee: 10000,
        processing_fee: 3000,
        total_fee: 13000,
        bank_name: 'Afriland First Bank',
        bank_account_number: '1000123456789012',
        content: `
            <p><strong>LE MINISTRE DE L'ENSEIGNEMENT SUPERIEUR</strong></p>
            <p>Vu le décret N° 2010/384 du 20 décembre 2010 portant organisation de l'École Normale Supérieure ;</p>
            <p>Arrête :</p>
            <p><strong>Article 1er :</strong> Il est ouvert un concours d'entrée en Première Année à l'École Normale Supérieure pour l'année académique 2024-2025.</p>
            <p><strong>Article 2 :</strong> Les candidats doivent être titulaires du Baccalauréat série C, D, E ou équivalent.</p>
            <p><strong>Article 3 :</strong> Les épreuves écrites portent sur les matières de spécialité.</p>
            <p><strong>Article 4 :</strong> Le présent arrêté entre en vigueur à compter de sa signature.</p>
        `,
        conditions: [
            'Être titulaire du Baccalauréat série C, D, E ou équivalent',
            'Avoir effectué le paiement des frais de concours (13 000 FCFA)',
            'Avoir une moyenne minimale de 14/20 au Baccalauréat',
            'Déposer un dossier complet dans les délais impartis',
        ],
        document_url: 'https://www.ens-yaounde.cm/arretes/concours-2024.pdf',
        categories: ['Grande École', 'Première Année'],
    },
    {
        id: 4,
        title: 'Arrêté N° 004/2024 portant ouverture du concours d\'entrée à l\'École Polytechnique',
        institution: 'École Polytechnique de Yaoundé',
        type: 'Première Année',
        date: '2024-02-10',
        deadline_date: '2024-05-15',
        exam_date: '2024-07-10',
        results_date: '2024-08-20',
        registration_fee: 15000,
        processing_fee: 5000,
        total_fee: 20000,
        bank_name: 'Afriland First Bank',
        bank_account_number: '1000123456789012',
        content: `
            <p><strong>LE MINISTRE DE L'ENSEIGNEMENT SUPERIEUR</strong></p>
            <p>Vu le décret N° 2008/281 du 09 août 2008 portant organisation de l'École Polytechnique ;</p>
            <p>Arrête :</p>
            <p><strong>Article 1er :</strong> Il est ouvert un concours d'entrée en Première Année à l'École Polytechnique pour l'année académique 2024-2025.</p>
            <p><strong>Article 2 :</strong> Les candidats doivent être titulaires du Baccalauréat série C, D, E, F ou équivalent.</p>
            <p><strong>Article 3 :</strong> Les épreuves écrites portent sur les mathématiques, la physique et la chimie.</p>
            <p><strong>Article 4 :</strong> Le présent arrêté entre en vigueur à compter de sa signature.</p>
        `,
        conditions: [
            'Être titulaire du Baccalauréat série C, D, E, F ou équivalent',
            'Avoir effectué le paiement des frais de concours (20 000 FCFA)',
            'Avoir une moyenne minimale de 15/20 au Baccalauréat',
            'Réussir les épreuves écrites et orales',
        ],
        document_url: 'https://www.polytechnique-yaounde.cm/arretes/concours-2024.pdf',
        categories: ['Grande École', 'Première Année'],
    },
    {
        id: 5,
        title: 'Arrêté N° 005/2024 portant ouverture du concours d\'entrée à l\'École Nationale Supérieure des Travaux Publics',
        institution: 'ENSTP Yaoundé',
        type: 'Première Année',
        date: '2024-02-15',
        deadline_date: '2024-05-20',
        exam_date: '2024-07-15',
        results_date: '2024-08-25',
        registration_fee: 12000,
        processing_fee: 3000,
        total_fee: 15000,
        bank_name: 'Afriland First Bank',
        bank_account_number: '1000123456789012',
        content: `
            <p><strong>LE MINISTRE DES TRAVAUX PUBLICS</strong></p>
            <p>Vu le décret N° 2015/123 du 15 mars 2015 portant organisation de l'ENSTP ;</p>
            <p>Arrête :</p>
            <p><strong>Article 1er :</strong> Il est ouvert un concours d'entrée en Première Année à l'ENSTP pour l'année académique 2024-2025.</p>
            <p><strong>Article 2 :</strong> Les candidats doivent être titulaires du Baccalauréat série C, D, E, F ou équivalent.</p>
            <p><strong>Article 3 :</strong> Les spécialités offertes sont : Génie Civil, Génie Rural, Topographie.</p>
            <p><strong>Article 4 :</strong> Le présent arrêté entre en vigueur à compter de sa signature.</p>
        `,
        conditions: [
            'Être titulaire du Baccalauréat série C, D, E, F ou équivalent',
            'Avoir effectué le paiement des frais de concours (15 000 FCFA)',
            'Avoir une moyenne minimale de 13/20 au Baccalauréat',
            'Déposer un dossier complet dans les délais impartis',
        ],
        document_url: 'https://www.enstp-yaounde.cm/arretes/concours-2024.pdf',
        categories: ['Grande École', 'Première Année'],
    },
];

export default function Arretes() {
    const [arretes, setArretes] = useState([]);
    const [selectedArrete, setSelectedArrete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchArretes = async () => {
            try {
                setLoading(true);
                console.log('📡 Chargement des arrêtés depuis l\'API...');
                const response = await api.get('/arretes', {
                    params: {
                        active: true,
                    },
                });
                
                console.log('📥 Réponse API arrêtés:', response.data);
                
                // Vérifier que les données existent
                const arretesData = response.data?.data || response.data || [];
                
                if (!Array.isArray(arretesData)) {
                    console.warn('⚠️ Les données des arrêtés ne sont pas un tableau:', arretesData);
                    console.log('🔄 Utilisation des données par défaut');
                    setArretes(arretesDataDefault);
                    return;
                }
                
                if (arretesData.length === 0) {
                    console.warn('⚠️ Aucun arrêté retourné par l\'API');
                    console.log('🔄 Utilisation des données par défaut');
                    setArretes(arretesDataDefault);
                    return;
                }
                
                console.log(`✅ ${arretesData.length} arrêté(s) reçu(s) de l'API`);
                
                // Transformer les données de l'API pour correspondre au format attendu
                const transformedArretes = arretesData.map(arrete => {
                    // Déterminer la catégorie (Université ou Grande École)
                    let categoryName = 'Autre';
                    if (arrete.category === 'universite' || arrete.category === 'université') {
                        categoryName = 'Université';
                    } else if (arrete.category === 'grande_ecole' || arrete.category === 'grande école' || arrete.category === 'grande_ecole') {
                        categoryName = 'Grande École';
                    } else if (!arrete.category && arrete.institution) {
                        // Si category n'est pas défini, essayer de le déduire de l'institution
                        const institutionLower = arrete.institution.toLowerCase();
                        if (institutionLower.includes('université') || institutionLower.includes('university')) {
                            categoryName = 'Université';
                        } else if (institutionLower.includes('école') || institutionLower.includes('ecole') || 
                                   institutionLower.includes('institut') || institutionLower.includes('institute') ||
                                   institutionLower.includes('polytechnique') || institutionLower.includes('normale')) {
                            categoryName = 'Grande École';
                        }
                    }
                    
                    // Déterminer le type (Première Année ou Troisième Année)
                    let typeName = 'Both';
                    if (arrete.type === 'premiere_annee') {
                        typeName = 'Première Année';
                    } else if (arrete.type === 'troisieme_annee') {
                        typeName = 'Troisième Année';
                    }
                    
                    // Créer le tableau de catégories (sans valeurs vides/null)
                    const categories = [];
                    if (categoryName && categoryName !== 'Autre') {
                        categories.push(categoryName);
                    }
                    if (typeName && typeName !== 'Both') {
                        categories.push(typeName);
                    }
                    
                    console.log(`📋 Arrêté ${arrete.id}: category="${arrete.category}" → "${categoryName}", type="${arrete.type}" → "${typeName}", categories=[${categories.join(', ')}]`);
                    
                    return {
                        id: arrete.id,
                        title: arrete.title,
                        institution: arrete.institution,
                        type: arrete.type, // Garder le type original (premiere_annee, troisieme_annee, both)
                        publication_date: arrete.publication_date,
                        date: arrete.publication_date,
                        deadline_date: arrete.deadline_date,
                        exam_date: arrete.exam_date,
                        results_date: arrete.results_date,
                        registration_fee: parseFloat(arrete.registration_fee) || 0,
                        processing_fee: parseFloat(arrete.processing_fee) || 0,
                        total_fee: parseFloat(arrete.total_fee) || 0,
                        bank_name: arrete.bank_name || null,
                        bank_account_number: arrete.bank_account_number || null,
                        content: arrete.content || '',
                        conditions: arrete.conditions || [],
                        document_url: arrete.external_url || null,
                        document_path: arrete.document_path || null,
                        categories: categories.length > 0 ? categories : ['Autre'], // Au moins une catégorie
                    };
                });
                
                console.log(`✅ ${transformedArretes.length} arrêté(s) transformé(s)`);
                console.log('📋 Catégories trouvées:', [...new Set(transformedArretes.flatMap(a => a.categories || []))]);
                
                // Utiliser les arrêtés transformés ou les données par défaut si aucun arrêté transformé
                const finalArretes = transformedArretes.length > 0 ? transformedArretes : arretesDataDefault;
                setArretes(finalArretes);
                console.log(`✅ ${finalArretes.length} arrêté(s) assigné(s) à l'état`);
            } catch (error) {
                console.error('❌ Erreur lors du chargement des arrêtés:', error);
                console.error('Détails:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                // En cas d'erreur, utiliser les données par défaut
                console.log('🔄 Utilisation des données par défaut en cas d\'erreur');
                setArretes(arretesDataDefault);
                toast.error('Impossible de charger les arrêtés depuis le serveur. Affichage des données par défaut.', { duration: 3000 });
            } finally {
                setLoading(false);
            }
        };

        fetchArretes();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'Non définie';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleView = (arrete) => {
        setSelectedArrete(arrete);
    };

    const handleDownload = async (arrete) => {
        try {
            console.log('📥 Téléchargement de l\'arrêté:', arrete.id);
            const filename = arrete.type === 'premiere_annee' || arrete.type === 'Première Année'
                ? 'arrete-premiere-annee.pdf'
                : arrete.type === 'troisieme_annee' || arrete.type === 'Troisième Année'
                ? 'arrete-troisieme-annee.pdf'
                : `arrete-${arrete.id}.pdf`;

            // Téléchargement sans authentification (fetch sans token pour que les visiteurs non connectés puissent télécharger)
            const downloadUrl = `${window.location.origin}/api/arretes/${arrete.id}/download`;
            const response = await fetch(downloadUrl, { method: 'GET' });

            if (!response.ok) {
                if (response.status === 404) throw new Error('Le fichier PDF est introuvable');
                if (response.status === 500) throw new Error('Erreur serveur lors du téléchargement');
                throw new Error(`Erreur ${response.status}`);
            }

            const blob = await response.blob();
            if (!blob || blob.size === 0) throw new Error('Le fichier PDF est vide');

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

            toast.success('Téléchargement de l\'arrêté réussi !');
        } catch (error) {
            console.error('❌ Erreur lors du téléchargement:', error);
            let errorMessage = 'Erreur lors du téléchargement de l\'arrêté';
            if (error.message) errorMessage = error.message;
            toast.error(errorMessage, { duration: 5000 });
        }
    };

    const handleReadOnline = (arrete) => {
        setSelectedArrete(arrete);
    };

    const handleViewPDF = async (arrete) => {
        try {
            console.log('👁️ Ouverture du PDF pour l\'arrêté:', arrete.id);
            const viewUrl = `${window.location.origin}/api/arretes/${arrete.id}/download`;

            const response = await fetch(viewUrl, { method: 'GET' });
            if (!response.ok) {
                if (response.status === 404) {
                    toast.error('Le fichier PDF est introuvable');
                    return;
                }
                toast.error('Impossible d\'ouvrir le PDF');
                return;
            }

            const blob = await response.blob();
            if (blob && blob.size > 0) {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                toast.success('Ouverture du PDF dans un nouvel onglet...');
                return;
            }
            handleReadOnline(arrete);
        } catch (error) {
            console.error('❌ Erreur lors de l\'ouverture du PDF:', error);
            handleReadOnline(arrete);
        }
    };

    // Logique de filtrage améliorée
    const filteredArretes = React.useMemo(() => {
        console.log('🔍 Filtrage des arrêtés:', { 
            filter, 
            totalArretes: arretes.length,
            arretes: arretes.map(a => ({ id: a.id, categories: a.categories, type: a.type, institution: a.institution }))
        });
        
        // Filtre "Tous" : retourner tous les arrêtés
        if (filter === 'all') {
            console.log(`✅ Filtre "Tous": retour de tous les arrêtés (${arretes.length})`);
            return arretes;
        }
        
        // Filtrage par type (premiere_annee, troisieme_annee)
        if (filter === 'premiere_annee' || filter === 'troisieme_annee') {
            const filtered = arretes.filter(a => {
                // Vérifier le type (peut être 'premiere_annee' ou 'Première Année')
                const typeMatch = a.type === filter || 
                                  a.type === 'both' ||
                                  (filter === 'premiere_annee' && a.type === 'Première Année') ||
                                  (filter === 'troisieme_annee' && a.type === 'Troisième Année');
                
                // Vérifier aussi dans les catégories
                const categoryMatch = a.categories && Array.isArray(a.categories) && (
                    (filter === 'premiere_annee' && a.categories.includes('Première Année')) ||
                    (filter === 'troisieme_annee' && a.categories.includes('Troisième Année'))
                );
                
                const matches = typeMatch || categoryMatch;
                return matches;
            });
            console.log(`✅ Filtre par type "${filter}": ${filtered.length} arrêtés trouvés sur ${arretes.length}`);
            return filtered;
        }
        
        // Filtrage par catégorie (Université, Grande École)
        const filtered = arretes.filter(a => {
            // Vérifier que categories existe et est un tableau
            if (!a.categories || !Array.isArray(a.categories)) {
                console.log(`  ⚠️ Arrêté ${a.id} n'a pas de catégories valides:`, a.categories);
                return false;
            }
            
            // Vérifier si le filtre correspond à une catégorie
            const matches = a.categories.includes(filter);
            console.log(`  Arrêté ${a.id}: categories=${JSON.stringify(a.categories)}, filter="${filter}", matches=${matches}`);
            return matches;
        });
        
        console.log(`✅ Filtre par catégorie "${filter}": ${filtered.length} arrêtés trouvés sur ${arretes.length}`);
        
        // Si aucun résultat et que c'est un filtre par catégorie, afficher un message de debug
        if (filtered.length === 0 && (filter === 'Université' || filter === 'Grande École')) {
            console.warn(`⚠️ Aucun arrêté trouvé pour la catégorie "${filter}". Vérifier les catégories des arrêtés:`, 
                arretes.map(a => ({ id: a.id, categories: a.categories, institution: a.institution }))
            );
        }
        
        return filtered;
    }, [filter, arretes]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Chargement des arrêtés...</p>
                </div>
            </div>
        );
    }

    if (selectedArrete) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{selectedArrete.title}</h1>
                        <button
                            onClick={() => setSelectedArrete(null)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-lg text-indigo-600 font-semibold">{selectedArrete.institution}</p>
                        <p className="text-sm text-gray-500">Publié le {formatDate(selectedArrete.date || selectedArrete.publication_date)}</p>
                    </div>

                    <div className="prose max-w-none mb-8">
                        <div className="space-y-6">
                            <div dangerouslySetInnerHTML={{ __html: selectedArrete.content }} />

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Dates Importantes</h3>
                                <ul className="space-y-2 text-yellow-700">
                                    <li><strong>Date limite de dépôt de dossier :</strong> {formatDate(selectedArrete.deadline_date)}</li>
                                    <li><strong>Date de composition :</strong> {formatDate(selectedArrete.exam_date)}</li>
                                    <li><strong>Date de publication des résultats :</strong> {formatDate(selectedArrete.results_date)}</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">💰 Frais du Concours</h3>
                                <ul className="space-y-2 text-blue-700">
                                    <li><strong>Frais d'inscription :</strong> {selectedArrete.registration_fee.toLocaleString()} FCFA</li>
                                    <li><strong>Frais de traitement :</strong> {selectedArrete.processing_fee.toLocaleString()} FCFA</li>
                                    <li><strong>Total à payer :</strong> <span className="text-lg font-bold">{selectedArrete.total_fee.toLocaleString()} FCFA</span></li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                                <h3 className="text-lg font-semibold text-purple-800 mb-2">🏦 Informations Bancaires et Paiement</h3>
                                {(selectedArrete.bank_name || selectedArrete.bank_account_number) ? (
                                    <>
                                        <ul className="space-y-2 text-purple-700 mb-3">
                                            {selectedArrete.bank_name && (
                                                <li><strong>Banque :</strong> {selectedArrete.bank_name}</li>
                                            )}
                                            {selectedArrete.bank_account_number && (
                                                <li><strong>Numéro de compte :</strong> <span className="font-mono font-bold text-lg">{selectedArrete.bank_account_number}</span></li>
                                            )}
                                        </ul>
                                        <div className="bg-purple-100 border border-purple-300 rounded p-3 mt-3">
                                            <p className="text-sm text-purple-800 font-semibold mb-2">
                                                ⚠️ Important - Instructions de paiement :
                                            </p>
                                            <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                                                <li>Effectuez le paiement des frais de concours (<strong>{selectedArrete.total_fee.toLocaleString()} FCFA</strong>) sur le compte bancaire indiqué ci-dessus.</li>
                                                <li>Après le paiement, vous recevrez un <strong>reçu de paiement</strong> de la banque.</li>
                                                <li>Sur ce reçu, vous trouverez un <strong>numéro de quitus</strong> (format : Q suivi de 5 chiffres, ex: Q12345).</li>
                                                <li>Ce numéro de quitus est <strong>obligatoire</strong> pour vous connecter à la plateforme SGEE.</li>
                                                <li>Un quitus ne peut être utilisé que par <strong>un seul candidat</strong> - ne le partagez pas.</li>
                                                <li>Une fois connecté avec votre quitus, vous pourrez commencer votre enrôlement en ligne.</li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-purple-100 border border-purple-300 rounded p-3">
                                        <p className="text-sm text-purple-800 font-semibold mb-2">
                                            ⚠️ Important - Instructions de paiement :
                                        </p>
                                        <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                                            <li>Effectuez le paiement des frais de concours (<strong>{selectedArrete.total_fee.toLocaleString()} FCFA</strong>) selon les modalités indiquées par l'établissement.</li>
                                            <li>Après le paiement, vous recevrez un <strong>reçu de paiement</strong> de la banque.</li>
                                            <li>Sur ce reçu, vous trouverez un <strong>numéro de quitus</strong> (format : Q suivi de 5 chiffres, ex: Q12345).</li>
                                            <li>Ce numéro de quitus est <strong>obligatoire</strong> pour vous connecter à la plateforme SGEE.</li>
                                            <li>Un quitus ne peut être utilisé que par <strong>un seul candidat</strong> - ne le partagez pas.</li>
                                            <li>Une fois connecté avec votre quitus, vous pourrez commencer votre enrôlement en ligne.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                <h3 className="text-lg font-semibold text-green-800 mb-2">📋 Conditions d'Admission</h3>
                                <ul className="space-y-2 text-green-700">
                                    {selectedArrete.conditions.map((condition, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{condition}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                        {(selectedArrete.document_url || selectedArrete.document_path) && (
                            <button
                                onClick={() => handleViewPDF(selectedArrete)}
                                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Voir le PDF original
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedArrete(null)}
                            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour à la liste
                        </button>
                        <button
                            onClick={() => handleDownload(selectedArrete)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Télécharger l'arrêté
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Arrêtés des Concours</h1>
                <p className="text-lg text-gray-600 mb-2">
                    Consultez les arrêtés officiels des concours d'entrée dans les établissements d'enseignement supérieur du Cameroun
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Comment utiliser :</strong> Cliquez sur <strong>"Lire"</strong> pour consulter l'arrêté directement sur la plateforme. 
                        Si un PDF est disponible, vous pouvez le <strong>"Voir"</strong> ou le <strong>"Télécharger"</strong>.
                    </p>
                </div>
            </div>

            {/* Filtres */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'all'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Tous
                </button>
                <button
                    onClick={() => setFilter('Université')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'Université'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Universités
                </button>
                <button
                    onClick={() => setFilter('Grande École')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'Grande École'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Grandes Écoles
                </button>
                <button
                    onClick={() => setFilter('premiere_annee')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'premiere_annee'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Première Année
                </button>
                <button
                    onClick={() => setFilter('troisieme_annee')}
                    className={`px-4 py-2 rounded-lg transition ${
                        filter === 'troisieme_annee'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Troisième Année
                </button>
            </div>

            {/* Liste des arrêtés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArretes.map((arrete) => (
                    <div key={arrete.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                {arrete.title}
                            </h3>
                            <p className="text-indigo-600 font-semibold">{arrete.institution}</p>
                            <p className="text-sm text-gray-500 mt-1">Publié le {formatDate(arrete.date || arrete.publication_date)}</p>
                        </div>

                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {arrete.categories.map((cat, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-2 py-1 text-xs rounded font-semibold ${
                                            cat === 'Première Année' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : cat === 'Troisième Année'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-indigo-100 text-indigo-700'
                                        }`}
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4 space-y-2 text-sm">
                            <p><strong>Date limite :</strong> {formatDate(arrete.deadline_date)}</p>
                            <p><strong>Date d'examen :</strong> {formatDate(arrete.exam_date)}</p>
                            <p><strong>Frais :</strong> {arrete.total_fee.toLocaleString()} FCFA</p>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => handleReadOnline(arrete)}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                            >
                                Lire
                            </button>
                            {(arrete.document_url || arrete.document_path) ? (
                                <button
                                    onClick={() => handleDownload(arrete)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                >
                                    Télécharger
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm"
                                    title="PDF non disponible"
                                >
                                    PDF indisponible
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredArretes.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Aucun arrêté disponible pour cette catégorie.</p>
                </div>
            )}
        </div>
    );
}
