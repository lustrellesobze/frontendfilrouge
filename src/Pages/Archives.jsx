import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Archives() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [examPapers, setExamPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeEnrollment, setActiveEnrollment] = useState(null);
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [paperDetail, setPaperDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showSolutions, setShowSolutions] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedPaper) {
            loadPaperDetail(selectedPaper.id);
        } else {
            setPaperDetail(null);
        }
    }, [selectedPaper]);

    const loadPaperDetail = async (id) => {
        try {
            setLoadingDetail(true);
            const res = await api.get(`/exams/${id}`);
            setPaperDetail(res.data);
        } catch (err) {
            console.error('Error loading exam detail:', err);
            toast.error('Impossible de charger le détail de l\'épreuve');
            setPaperDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            
            const enrollmentsResponse = await api.get('/enrollments');
            const enrollments = enrollmentsResponse.data.data || enrollmentsResponse.data || [];
            const active = enrollments.find(
                (e) => e.status === 'submitted' || e.status === 'validated'
            ) || enrollments.find((e) => e.status === 'draft');
            setActiveEnrollment(active);

            // Même liste que "Nos anciennes épreuves" : toutes les épreuves (sans filtre programme pour afficher tout)
            try {
                const params = new URLSearchParams();
                const papersResponse = await api.get(`/exams?${params.toString()}`);
                const data = papersResponse.data.data ?? papersResponse.data;
                setExamPapers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error loading exam papers:', error);
                setExamPapers([]);
            }

        } catch (error) {
            console.error('Error loading archives:', error);
            toast.error('Erreur lors du chargement des archives');
        } finally {
            setLoading(false);
        }
    };

    const getViewUrl = (id) => `/api/exams/${id}/view`;
    const getDownloadUrl = (id) => `/api/exams/${id}/download`;
    const handleViewExamPaper = (paper) => {
        setSelectedPaper(paper);
        setShowSolutions({});
    };
    const toggleSolution = (exerciseId) => {
        setShowSolutions((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Archives
                </h1>
                <p className="text-gray-600">
                    Consultez vos épreuves passées et lancez une simulation pour vous entraîner.
                </p>
            </div>

            {/* Mes Épreuves */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <div className="space-y-4">
                            {examPapers.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📄</div>
                                    <p className="text-gray-600 mb-2">Aucune épreuve disponible pour le moment</p>
                                    <p className="text-sm text-gray-500">
                                        Les épreuves de votre concours seront disponibles après l'examen
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {examPapers.map((paper) => (
                                        <div
                                            key={paper.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {paper.title || `Épreuve ${paper.subject || 'Générale'}`}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {paper.subject || 'Matière non spécifiée'}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    {paper.exam_year || new Date().getFullYear()}
                                                </span>
                                            </div>
                                            
                                            {paper.description && (
                                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                    {paper.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                <span>{paper.exam_year || '—'}</span>
                                                <span>{paper.program?.name || ''}</span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewExamPaper(paper)}
                                                    className="flex-1 min-w-[100px] px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition text-center"
                                                >
                                                    Voir le contenu
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/archives/simulation/${paper.id}`)}
                                                    className="flex-1 min-w-[120px] px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition text-center"
                                                >
                                                    Commencer la simulation
                                                </button>
                                                <a
                                                    href={getViewUrl(paper.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 min-w-[80px] px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition text-center"
                                                >
                                                    PDF
                                                </a>
                                                <a
                                                    href={getDownloadUrl(paper.id)}
                                                    download
                                                    className="flex-1 min-w-[80px] px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition text-center"
                                                >
                                                    Télécharger
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Modal / panneau détail épreuve avec exercices */}
                            {selectedPaper && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPaper(null)}>
                                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                                        <div className="p-4 border-b flex justify-between items-center">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {selectedPaper.title || `Épreuve ${selectedPaper.subject || ''}`}
                                            </h2>
                                            <button type="button" onClick={() => setSelectedPaper(null)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
                                        </div>
                                        <div className="p-4 flex gap-2 border-b bg-gray-50">
                                            <a href={getViewUrl(selectedPaper.id)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                                Ouvrir le PDF
                                            </a>
                                            <a href={getDownloadUrl(selectedPaper.id)} download className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                                                Télécharger le PDF
                                            </a>
                                        </div>
                                        <div className="p-4 overflow-y-auto flex-1">
                                            {loadingDetail ? (
                                                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" /></div>
                                            ) : paperDetail?.exercises?.length > 0 ? (
                                                <div className="space-y-6">
                                                    <h3 className="font-semibold text-gray-900">Exercices de l&apos;épreuve</h3>
                                                    {paperDetail.exercises.map((ex, idx) => (
                                                        <div key={ex.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                                            <p className="font-medium text-gray-900 mb-2">
                                                                <span className="text-blue-600 mr-2">{idx + 1}.</span>
                                                                {ex.question_text}
                                                            </p>
                                                            {ex.type === 'qcm' && ex.options && Array.isArray(ex.options) && (
                                                                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                                                                    {ex.options.map((opt, i) => (
                                                                        <li key={i}>{opt}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleSolution(ex.id)}
                                                                className="text-sm text-blue-600 hover:underline"
                                                            >
                                                                {showSolutions[ex.id] ? 'Masquer la correction' : 'Voir la correction'}
                                                            </button>
                                                            {showSolutions[ex.id] && (
                                                                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-gray-800">
                                                                    {ex.correct_answer && <p><strong>Réponse correcte :</strong> {ex.correct_answer}</p>}
                                                                    {ex.solution && <p className="mt-1"><strong>Solution :</strong> {ex.solution}</p>}
                                                                    {ex.points && <p className="mt-1 text-gray-600">{ex.points} point(s)</p>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-center py-6">Aucun exercice pour cette épreuve. Consultez le PDF pour le sujet complet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
