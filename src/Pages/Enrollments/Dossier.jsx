import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Dossier() {
    const navigate = useNavigate();
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [missingDocuments, setMissingDocuments] = useState([]);

    useEffect(() => {
        loadEnrollment();
    }, []);

    const loadEnrollment = async () => {
        try {
            setLoading(true);
            // Récupérer l'enrôlement actif du candidat
            const response = await api.get('/enrollments');
            const enrollments = response.data.data || response.data || [];
            
            // Trouver l'enrôlement le plus récent (soumis ou rejeté)
            const activeEnrollment = enrollments.find(e => 
                e.status === 'submitted' || e.status === 'rejected' || e.status === 'validated'
            ) || enrollments[0];

            if (activeEnrollment) {
                // Charger les détails complets
                const detailResponse = await api.get(`/enrollments/${activeEnrollment.id}`);
                const enrollmentData = detailResponse.data;
                setEnrollment(enrollmentData);
                
                // Charger les documents
                if (enrollmentData.documents) {
                    setDocuments(enrollmentData.documents);
                }

                // Extraire les documents manquants depuis les métadonnées
                if (enrollmentData.metadata?.rejection?.missing_documents) {
                    setMissingDocuments(enrollmentData.metadata.rejection.missing_documents);
                }
            }
        } catch (error) {
            console.error('Error loading enrollment:', error);
            toast.error('Erreur lors du chargement du dossier');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (type, file) => {
        if (!enrollment || !file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('enrollment_id', enrollment.id);

            const response = await api.post('/enrollment-documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Document téléchargé avec succès');
            
            // Recharger l'enrôlement et les documents
            await loadEnrollment();

            // Retirer le document de la liste des manquants
            setMissingDocuments(prev => prev.filter(doc => doc !== type));
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Erreur lors du téléchargement du document');
        }
    };

    const handleViewDocument = async (document) => {
        try {
            const url = `/api/enrollment-documents/${document.id}/view`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error viewing document:', error);
            toast.error('Erreur lors de l\'ouverture du document');
        }
    };

    const handleSubmit = async () => {
        if (!enrollment) return;

        // Ne pas permettre la soumission si le dossier est déjà validé
        if (enrollment.status === 'validated') {
            toast.error('Ce dossier a déjà été validé et ne peut plus être modifié');
            return;
        }

        // Vérifier que tous les documents requis sont présents
        const requiredDocs = ['photo', 'cni', 'diplome'];
        const uploadedTypes = documents.map(doc => doc.type);
        const stillMissing = requiredDocs.filter(doc => !uploadedTypes.includes(doc));

        // Vérifier aussi le quitus si nécessaire
        if (!enrollment.quitus || enrollment.quitus.status !== 'validated') {
            stillMissing.push('quitus');
        }

        if (stillMissing.length > 0) {
            const missingLabels = {
                'photo': 'Photo du candidat',
                'cni': 'CNI ou Acte de naissance',
                'diplome': 'Diplôme',
                'quitus': 'Quitus validé',
            };
            const missingList = stillMissing.map(doc => missingLabels[doc] || doc).join(', ');
            toast.error(`Veuillez télécharger tous les documents requis avant de soumettre. Manquants : ${missingList}`);
            return;
        }

        if (!window.confirm('Êtes-vous sûr de vouloir soumettre votre dossier ? Cette action est irréversible.')) {
            return;
        }

        try {
            setSubmitting(true);
            await api.post(`/enrollments/${enrollment.id}/submit`, {
                program_id: enrollment.program_id,
                academic_session_id: enrollment.academic_session_id,
            });
            toast.success('Dossier soumis avec succès');
            await loadEnrollment(); // Recharger pour mettre à jour le statut
        } catch (error) {
            console.error('Error submitting enrollment:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la soumission du dossier';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'draft': 'Brouillon',
            'submitted': 'Soumis',
            'validated': 'Validé',
            'rejected': 'Rejeté',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'text-gray-600',
            'submitted': 'text-yellow-600',
            'validated': 'text-green-600',
            'rejected': 'text-red-600',
        };
        return colors[status] || 'text-gray-600';
    };

    const getDocumentLabel = (type) => {
        const labels = {
            'photo': 'Photo du candidat',
            'cni': 'Photo CNI',
            'acte_naissance': 'Acte de naissance',
            'diplome': 'Scan du diplôme',
            'quitus': 'Quitus',
        };
        return labels[type] || type;
    };

    const getDocumentType = (label) => {
        const types = {
            'Photo du candidat': 'photo',
            'Photo CNI': 'cni',
            'Acte de naissance': 'acte_naissance',
            'Scan du diplôme': 'diplome',
            'Quitus': 'quitus',
        };
        return types[label] || label.toLowerCase();
    };

    const isDocumentUploaded = (type) => {
        return documents.some(doc => doc.type === type);
    };

    const getDocumentForType = (type) => {
        return documents.find(doc => doc.type === type);
    };

    const canSubmit = () => {
        if (!enrollment) return false;
        
        // Ne jamais permettre la soumission si le dossier est validé
        if (enrollment.status === 'validated') return false;
        
        // Permettre la soumission seulement si le statut est 'draft' ou 'rejected'
        if (!['draft', 'rejected'].includes(enrollment.status)) return false;
        
        // Si le dossier est rejeté, vérifier que tous les documents manquants sont maintenant présents
        if (enrollment.status === 'rejected' && missingDocuments.length > 0) {
            const uploadedTypes = documents.map(doc => doc.type);
            const hasAllMissing = missingDocuments.every(doc => {
                if (doc === 'quitus') {
                    return enrollment.quitus && enrollment.quitus.status === 'validated';
                }
                return uploadedTypes.includes(doc);
            });
            return hasAllMissing;
        }
        
        // Pour les brouillons, vérifier que tous les documents requis sont présents
        const requiredDocs = ['photo', 'cni', 'diplome'];
        const uploadedTypes = documents.map(doc => doc.type);
        const hasAllRequired = requiredDocs.every(doc => uploadedTypes.includes(doc));
        const hasQuitus = enrollment.quitus && enrollment.quitus.status === 'validated';
        
        return hasAllRequired && hasQuitus;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Chargement du dossier...</div>
            </div>
        );
    }

    if (!enrollment) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Aucun dossier trouvé.</p>
                <button
                    onClick={() => navigate('/enrollments/create')}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Créer un dossier
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Dossier Officiel</h1>
                    <p className="text-gray-600">
                        Concours: {enrollment.academicSession?.label || enrollment.academicSession?.code || 'N/A'}
                    </p>
                </div>

                {/* Statut */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <svg
                                className={`h-6 w-6 ${getStatusColor(enrollment.status)}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {enrollment.status === 'rejected' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                ) : enrollment.status === 'validated' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                            <div>
                                <p className="text-sm text-gray-600">STATUT DE MON DOSSIER</p>
                                <p className={`text-2xl font-bold ${getStatusColor(enrollment.status)}`}>
                                    {getStatusLabel(enrollment.status).toUpperCase()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit() || submitting}
                            className={`px-6 py-3 rounded-md font-medium transition ${
                                canSubmit() && !submitting
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {submitting ? 'Soumission...' : 'Soumettre le dossier'}
                        </button>
                    </div>

                    {/* Message de rejet */}
                    {enrollment.status === 'rejected' && enrollment.metadata?.rejection && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-medium text-red-900 mb-2">Raison du rejet :</p>
                            {enrollment.metadata.rejection.missing_documents && enrollment.metadata.rejection.missing_documents.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-sm text-red-800 font-medium">Documents manquants :</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        {enrollment.metadata.rejection.missing_documents.map((doc, index) => {
                                            const labels = {
                                                'photo': 'Photo du candidat',
                                                'cni': 'CNI ou Acte de naissance',
                                                'diplome': 'Diplôme',
                                                'quitus': 'Quitus validé',
                                            };
                                            return (
                                                <li key={index} className="text-sm text-red-700">
                                                    {labels[doc] || doc}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                            {enrollment.metadata.rejection.reason && (
                                <p className="text-sm text-red-800 mt-2">
                                    <span className="font-medium">Motif :</span> {enrollment.metadata.rejection.reason}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo CNI */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo CNI</h3>
                        <p className="text-sm text-gray-500 mb-4">Format: PDF ou Image</p>
                        
                        {isDocumentUploaded('cni') ? (
                            <>
                                <div className="mb-4">
                                    <img
                                        src={`/api/enrollment-documents/${getDocumentForType('cni').id}/view`}
                                        alt="CNI"
                                        className="w-full h-48 object-cover rounded border border-gray-200"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewDocument(getDocumentForType('cni'))}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>Visualiser</span>
                                    </button>
                                    <label className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-center space-x-2">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Modifier le fichier</span>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleFileUpload('cni', e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm text-gray-500 mb-4">AUCUN FICHIER</p>
                                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Ajouter un fichier</span>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                handleFileUpload('cni', e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Scan du diplôme */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan du diplôme</h3>
                        <p className="text-sm text-gray-500 mb-4">Format: PDF ou Image</p>
                        
                        {isDocumentUploaded('diplome') ? (
                            <>
                                <div className="mb-4">
                                    <div className="w-full h-48 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewDocument(getDocumentForType('diplome'))}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>Visualiser</span>
                                    </button>
                                    <label className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-center space-x-2">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Modifier le fichier</span>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleFileUpload('diplome', e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm text-gray-500 mb-4">AUCUN FICHIER</p>
                                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Ajouter un fichier</span>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                handleFileUpload('diplome', e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
