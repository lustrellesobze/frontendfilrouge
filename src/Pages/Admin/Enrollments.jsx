import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminEnrollments() {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [missingDocuments, setMissingDocuments] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'processed'
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        validated: 0,
        rejected: 0,
    });
    
    // Liste des documents requis
    const requiredDocuments = [
        { id: 'photo', label: 'Photo du candidat' },
        { id: 'cni', label: 'CNI ou Acte de naissance' },
        { id: 'diplome', label: 'Diplôme' },
        { id: 'quitus', label: 'Quitus validé' },
    ];
    
    // Filtres
    const [filters, setFilters] = useState({
        search: '',
        program_id: '',
        centre_depot_id: '',
        gender: '',
        status: '',
        exam_center_id: '',
    });
    
    // Options pour les filtres
    const [programs, setPrograms] = useState([]);
    const [depotCenters, setDepotCenters] = useState([]);
    const [examCenters, setExamCenters] = useState([]);
    
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    useEffect(() => {
        loadFilterOptions();
        loadEnrollments();
    }, []);

    useEffect(() => {
        // Appliquer le filtre de statut selon l'onglet actif
        if (activeTab === 'pending') {
            if (filters.status !== 'submitted') {
                setFilters(prev => ({ ...prev, status: 'submitted' }));
            }
        } else if (activeTab === 'processed') {
            if (filters.status !== 'validated,rejected') {
                setFilters(prev => ({ ...prev, status: 'validated,rejected' }));
            }
        } else if (activeTab === 'all') {
            // Ne pas filtrer par statut si onglet "Tous"
            if (filters.status && (filters.status === 'submitted' || filters.status === 'validated,rejected')) {
                setFilters(prev => ({ ...prev, status: '' }));
            }
        }
    }, [activeTab]);

    useEffect(() => {
        loadEnrollments();
    }, [filters, pagination.current_page]);

    const loadFilterOptions = async () => {
        try {
            const [programsRes, depotCentersRes, examCentersRes] = await Promise.all([
                api.get('/programs', { params: { per_page: 100 } }),
                api.get('/centre-depots', { params: { per_page: 100 } }),
                api.get('/exam-centers', { params: { per_page: 100 } }),
            ]);
            
            setPrograms(programsRes.data.data || programsRes.data || []);
            setDepotCenters(depotCentersRes.data.data || depotCentersRes.data || []);
            setExamCenters(examCentersRes.data.data || examCentersRes.data || []);
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    };

    const loadEnrollments = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current_page,
                per_page: pagination.per_page,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                ),
            };
            const response = await api.get('/admin/enrollments', { params });
            const enrollmentsData = response.data.data || [];
            setEnrollments(enrollmentsData);
            
            // Calculer les statistiques
            const totalEnrollments = response.data.total || enrollmentsData.length;
            const pendingCount = enrollmentsData.filter(e => e.status === 'submitted' || e.status === 'draft').length;
            const validatedCount = enrollmentsData.filter(e => e.status === 'validated').length;
            const rejectedCount = enrollmentsData.filter(e => e.status === 'rejected').length;
            
            setStats({
                total: totalEnrollments,
                pending: pendingCount,
                validated: validatedCount,
                rejected: rejectedCount,
            });
            
            setPagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                per_page: response.data.per_page || 15,
                total: totalEnrollments,
            });
        } catch (error) {
            console.error('Error loading enrollments:', error);
            toast.error('Erreur lors du chargement des enrôlements');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (enrollment) => {
        try {
            const response = await api.get(`/admin/enrollments/${enrollment.id}`);
            setSelectedEnrollment(response.data);
            setShowModal(true);
        } catch (error) {
            console.error('Error loading enrollment details:', error);
            toast.error('Erreur lors du chargement des détails');
        }
    };

    const handleValidate = async () => {
        if (!selectedEnrollment) return;

        try {
            await api.post(`/admin/enrollments/${selectedEnrollment.id}/validate`);
            toast.success('Enrôlement validé avec succès');
            setShowModal(false);
            setSelectedEnrollment(null);
            loadEnrollments();
        } catch (error) {
            console.error('Error validating enrollment:', error);
            if (error.response?.data?.errors) {
                toast.error(error.response.data.message || 'Le dossier n\'est pas complet');
            } else {
                toast.error('Erreur lors de la validation');
            }
        }
    };

    const handleReject = async () => {
        if (!selectedEnrollment) {
            toast.error('Aucun enrôlement sélectionné');
            return;
        }

        if (!rejectReason.trim() && missingDocuments.length === 0) {
            toast.error('Veuillez fournir une raison de rejet ou sélectionner des documents manquants');
            return;
        }

        try {
            await api.post(`/admin/enrollments/${selectedEnrollment.id}/reject`, {
                reason: rejectReason,
                missing_documents: missingDocuments,
            });
            toast.success('Enrôlement rejeté');
            setShowRejectModal(false);
            setRejectReason('');
            setMissingDocuments([]);
            setSelectedEnrollment(null);
            loadEnrollments();
        } catch (error) {
            console.error('Error rejecting enrollment:', error);
            toast.error('Erreur lors du rejet');
        }
    };

    const toggleMissingDocument = (docId) => {
        setMissingDocuments(prev => 
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const handleExportPDF = async () => {
        try {
            toast.loading('Génération du PDF en cours...', { id: 'export-pdf' });
            
            // Préparer les paramètres de filtrage pour l'export
            const exportParams = {
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                ),
                export: 'pdf',
            };

            // Faire la requête pour obtenir le PDF
            const response = await api.get('/admin/enrollments/export/pdf', {
                params: exportParams,
                responseType: 'blob', // Important pour télécharger un fichier
            });

            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Nommer le fichier avec la date et les filtres
            const dateStr = new Date().toISOString().split('T')[0];
            const centerName = examCenters.find(c => c.id === parseInt(filters.exam_center_id))?.name || '';
            const fileName = centerName 
                ? `Liste_Candidats_${centerName.replace(/\s+/g, '_')}_${dateStr}.pdf`
                : `Liste_Candidats_${dateStr}.pdf`;
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('PDF exporté avec succès', { id: 'export-pdf' });
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Erreur lors de l\'export PDF. Veuillez réessayer.', { id: 'export-pdf' });
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
            submitted: { label: 'Soumis', color: 'bg-yellow-100 text-yellow-800' },
            validated: { label: 'Validé', color: 'bg-green-100 text-green-800' },
            rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
            unknown: { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' },
        };

        const config = statusConfig[status] || { label: status || 'Inconnu', color: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getMatricule = (enrollment) => {
        if (enrollment.enrollment_code) {
            return enrollment.enrollment_code;
        }
        return `CAND-${new Date(enrollment.created_at).getFullYear()}-${String(enrollment.id).padStart(5, '0')}`;
    };

    const getCni = (enrollment) => {
        const fromUser = enrollment?.student?.user?.national_id;
        const fromMeta = enrollment?.metadata?.numero_cni ?? enrollment?.metadata?.national_id;
        return fromUser || fromMeta || '—';
    };

    const displayEnrollments = enrollments;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Portail Gestion Candidats</h1>
                    <p className="text-sm text-gray-600 mt-1">Recherche avancée et filtrage par centres</p>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                >
                    Exporter Liste PDF
                </button>
            </div>

            {/* Statistiques et onglets */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                        <div className="text-sm text-gray-600 mt-1">Total Candidats</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-sm text-gray-600 mt-1">En Attente</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
                        <div className="text-sm text-gray-600 mt-1">Validés</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                        <div className="text-sm text-gray-600 mt-1">Rejetés</div>
                    </div>
                </div>

                {/* Graphique simple (bar chart) */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Répartition des dossiers</h3>
                    <div className="flex items-end gap-2 h-32">
                        {stats.total > 0 && (
                            <>
                                <div className="flex-1 flex flex-col items-center">
                                    <div 
                                        className="w-full bg-yellow-400 rounded-t transition-all hover:bg-yellow-500 cursor-pointer"
                                        style={{ height: `${(stats.pending / stats.total) * 100}%` }}
                                        title={`${stats.pending} en attente`}
                                    />
                                    <span className="text-xs text-gray-600 mt-2">En attente</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                    <div 
                                        className="w-full bg-green-400 rounded-t transition-all hover:bg-green-500 cursor-pointer"
                                        style={{ height: `${(stats.validated / stats.total) * 100}%` }}
                                        title={`${stats.validated} validés`}
                                    />
                                    <span className="text-xs text-gray-600 mt-2">Validés</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                    <div 
                                        className="w-full bg-red-400 rounded-t transition-all hover:bg-red-500 cursor-pointer"
                                        style={{ height: `${(stats.rejected / stats.total) * 100}%` }}
                                        title={`${stats.rejected} rejetés`}
                                    />
                                    <span className="text-xs text-gray-600 mt-2">Rejetés</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Onglets de filtrage rapide */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => {
                                setActiveTab('all');
                                setFilters(prev => ({ ...prev, status: '' }));
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'all'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Tous ({stats.total})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('pending');
                                setFilters(prev => ({ ...prev, status: 'submitted' }));
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'pending'
                                    ? 'border-yellow-600 text-yellow-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Non Traités ({stats.pending})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('processed');
                                setFilters(prev => ({ ...prev, status: 'validated,rejected' }));
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'processed'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Dossiers Traités ({stats.validated + stats.rejected})
                        </button>
                    </nav>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Recherche */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <svg
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Nom, matricule..."
                                value={filters.search}
                                onChange={(e) => {
                                    setFilters({ ...filters, search: e.target.value });
                                    setPagination({ ...pagination, current_page: 1 });
                                }}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Filière */}
                    <div>
                        <select
                            value={filters.program_id}
                            onChange={(e) => {
                                setFilters({ ...filters, program_id: e.target.value });
                                setPagination({ ...pagination, current_page: 1 });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Toutes les filières --</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Centre de dépôt */}
                    <div>
                        <select
                            value={filters.centre_depot_id}
                            onChange={(e) => {
                                setFilters({ ...filters, centre_depot_id: e.target.value });
                                setPagination({ ...pagination, current_page: 1 });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Tous les centres de dépôt --</option>
                            {depotCenters.map((center) => (
                                <option key={center.id} value={center.id}>
                                    {center.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sexe */}
                    <div>
                        <select
                            value={filters.gender}
                            onChange={(e) => {
                                setFilters({ ...filters, gender: e.target.value });
                                setPagination({ ...pagination, current_page: 1 });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tous les sexes</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                        </select>
                    </div>

                    {/* Statut */}
                    <div>
                        <select
                            value={filters.status}
                            onChange={(e) => {
                                setFilters({ ...filters, status: e.target.value });
                                setPagination({ ...pagination, current_page: 1 });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="draft">Brouillon</option>
                            <option value="pending">En attente</option>
                            <option value="submitted">Soumis</option>
                            <option value="validated">Validé</option>
                            <option value="rejected">Rejeté</option>
                        </select>
                    </div>
                </div>

                {/* Centre d'examen (ligne supplémentaire) */}
                <div className="mt-4">
                    <select
                        value={filters.exam_center_id}
                        onChange={(e) => {
                            setFilters({ ...filters, exam_center_id: e.target.value });
                            setPagination({ ...pagination, current_page: 1 });
                        }}
                        className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Tous les centres d'examen --</option>
                        {examCenters.map((center) => (
                            <option key={center.id} value={center.id}>
                                {center.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Chargement...</div>
                ) : enrollments.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">Aucun candidat trouvé</div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        CANDIDAT / MATRICULE
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        N° CNI
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        CENTRE D'EXAMEN
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        STATUT
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        FILIÈRE / SPÉCIALITÉ
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                                        ACTIONS
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayEnrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg
                                                    className="h-5 w-5 text-gray-400 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {enrollment.student?.user?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {getMatricule(enrollment)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                            {getCni(enrollment)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <svg
                                                    className="h-4 w-4 text-gray-400 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-sm text-gray-900">
                                                    {enrollment.assignedExamCenter?.name || enrollment.preferredCenter?.name || 'Non défini'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(enrollment.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {enrollment.program?.name || 'N/A'}
                                            </div>
                                            {enrollment.program?.cycle && (
                                                <div className="text-xs text-gray-500">
                                                    {enrollment.program.cycle}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDetails(enrollment)}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                Profil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-700">
                                    Affichage de {((pagination.current_page - 1) * pagination.per_page) + 1} à{' '}
                                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} sur{' '}
                                    {pagination.total} résultats
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                                        disabled={pagination.current_page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                                        disabled={pagination.current_page === pagination.last_page}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de détails (identique à avant) */}
            {showModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Détails de l'enrôlement
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedEnrollment(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Informations du candidat */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Profil du Candidat
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Nom complet</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.student?.user?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.student?.user?.email || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Téléphone</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.student?.user?.phone || selectedEnrollment.student?.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Code d'enrôlement</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.enrollment_code || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">N° CNI</p>
                                        <p className="text-sm font-medium text-gray-900 font-mono">
                                            {getCni(selectedEnrollment)}
                                        </p>
                                    </div>
                                    {selectedEnrollment.student?.gender && (
                                        <div>
                                            <p className="text-sm text-gray-600">Genre</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedEnrollment.student.gender === 'male' ? 'Masculin' : 
                                                 selectedEnrollment.student.gender === 'female' ? 'Féminin' : 
                                                 selectedEnrollment.student.gender}
                                            </p>
                                        </div>
                                    )}
                                    {selectedEnrollment.student?.birth_date && (
                                        <div>
                                            <p className="text-sm text-gray-600">Date de naissance</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(selectedEnrollment.student.birth_date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    )}
                                    {selectedEnrollment.student?.birthplace && (
                                        <div>
                                            <p className="text-sm text-gray-600">Lieu de naissance</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedEnrollment.student.birthplace}
                                            </p>
                                        </div>
                                    )}
                                    {selectedEnrollment.student?.nationality && (
                                        <div>
                                            <p className="text-sm text-gray-600">Nationalité</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedEnrollment.student.nationality}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informations académiques */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations académiques</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Programme</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.program?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Niveau</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.niveau?.libelle || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Centre d'examen</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.exam_center?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Centre de dépôt</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {selectedEnrollment.centre_depot?.nom || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Motif de rejet (visible par l'admin pour les candidatures rejetées par le responsable de filière) */}
                            {selectedEnrollment.status === 'rejected' && (selectedEnrollment.rejection_reason || selectedEnrollment.metadata?.rejection?.reason) && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-red-900 mb-2">Motif de rejet</h3>
                                    <p className="text-sm text-gray-800">
                                        {selectedEnrollment.rejection_reason || selectedEnrollment.metadata?.rejection?.reason}
                                    </p>
                                    {selectedEnrollment.metadata?.rejection?.missing_documents?.length > 0 && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Documents manquants : {selectedEnrollment.metadata.rejection.missing_documents.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Documents */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                                <div className="space-y-2">
                                    {selectedEnrollment.documents?.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                                                <p className="text-xs text-gray-500">{doc.type}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                doc.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {doc.status === 'verified' ? 'Vérifié' : 'En attente'}
                                            </span>
                                        </div>
                                    ))}
                                    {(!selectedEnrollment.documents || selectedEnrollment.documents.length === 0) && (
                                        <p className="text-sm text-gray-500">Aucun document</p>
                                    )}
                                </div>
                            </div>

                            {/* Complétude du dossier */}
                            {selectedEnrollment.is_complete !== undefined && (
                                <div className="mb-6">
                                    <div className={`p-4 rounded ${
                                        selectedEnrollment.is_complete ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                                    }`}>
                                        <p className={`text-sm font-medium ${
                                            selectedEnrollment.is_complete ? 'text-green-800' : 'text-yellow-800'
                                        }`}>
                                            {selectedEnrollment.is_complete
                                                ? '✓ Dossier complet'
                                                : '⚠ Dossier incomplet'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedEnrollment(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Fermer
                                </button>
                                {selectedEnrollment.status === 'submitted' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                setShowRejectModal(true);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                                        >
                                            Rejeter
                                        </button>
                                        <button
                                            onClick={handleValidate}
                                            disabled={!selectedEnrollment.is_complete}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Valider
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de rejet */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Rejeter l'enrôlement</h2>
                            
                            {/* Documents manquants */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Documents manquants (optionnel)
                                </label>
                                <div className="space-y-2 border border-gray-200 rounded-md p-4 bg-gray-50">
                                    {requiredDocuments.map((doc) => (
                                        <label
                                            key={doc.id}
                                            className="flex items-center space-x-3 cursor-pointer hover:bg-white p-2 rounded transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={missingDocuments.includes(doc.id)}
                                                onChange={() => toggleMissingDocument(doc.id)}
                                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">{doc.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {missingDocuments.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        {missingDocuments.length} document(s) sélectionné(s)
                                    </p>
                                )}
                            </div>

                            {/* Motif personnalisé */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motif du rejet {missingDocuments.length === 0 && '*'}
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder={
                                        missingDocuments.length > 0
                                            ? "Ajoutez un commentaire supplémentaire (optionnel)..."
                                            : "Expliquez la raison du rejet... (ex: Dossier incomplet, veuillez nous fournir les documents manquants)"
                                    }
                                />
                                {missingDocuments.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Si vous avez sélectionné des documents manquants, vous pouvez ajouter un commentaire supplémentaire
                                    </p>
                                )}
                            </div>

                            {/* Aperçu du message */}
                            {(rejectReason.trim() || missingDocuments.length > 0) && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-xs font-medium text-blue-900 mb-2">Aperçu du message qui sera envoyé au candidat :</p>
                                    <div className="text-sm text-blue-800 bg-white p-3 rounded border border-blue-200">
                                        <p className="font-medium mb-1">Votre enrôlement a été rejeté.</p>
                                        {missingDocuments.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-medium">Documents manquants :</p>
                                                <ul className="list-disc list-inside mt-1 space-y-1">
                                                    {missingDocuments.map(docId => {
                                                        const doc = requiredDocuments.find(d => d.id === docId);
                                                        return doc ? <li key={docId}>{doc.label}</li> : null;
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                        {rejectReason.trim() && (
                                            <p className="mt-2">
                                                <span className="font-medium">Motif :</span> {rejectReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                        setMissingDocuments([]);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                                >
                                    Confirmer le rejet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
