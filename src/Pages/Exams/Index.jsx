import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ExamsIndex() {
    const [examPapers, setExamPapers] = useState([]);
    const [filters, setFilters] = useState({
        program_id: '',
        search: '',
    });
    const [availableFilters, setAvailableFilters] = useState({
        years: [],
        subjects: [],
        programs: [],
        levels: [],
    });
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        loadExamPapers();
    }, [filters]);

    const loadFilters = async (papers = []) => {
        try {
            // Charger les programmes depuis l'API des ressources
            const programsResponse = await api.get('/public/programs');
            const programs = programsResponse.data?.data || programsResponse.data || [];
            
            // Extraire les années uniques depuis les exam papers
            const years = papers.length > 0 
                ? [...new Set(papers.map(p => p.exam_year).filter(Boolean))].sort((a, b) => b - a)
                : [];
            
            setAvailableFilters({
                programs: programs,
                years: years,
                subjects: [],
                levels: [],
            });
        } catch (error) {
            console.error('Erreur lors du chargement des filtres:', error);
            // Continuer avec des filtres vides si l'API échoue
            setAvailableFilters({
                programs: [],
                years: [],
                subjects: [],
                levels: [],
            });
        }
    };

    useEffect(() => {
        // Charger les filtres après avoir chargé les exam papers
        loadFilters(examPapers);
    }, [examPapers.length]);

    const loadExamPapers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            if (filters.program_id) params.append('program_id', filters.program_id);
            if (filters.search) params.append('search', filters.search);
            params.append('sort_by', 'exam_year');
            params.append('sort_order', 'desc');

            const response = await api.get(`/exams?${params.toString()}`);
            setExamPapers(response.data.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des épreuves:', error);
            toast.error('Erreur lors du chargement des épreuves');
            setExamPapers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleFilter = () => {
        setShowFilter(!showFilter);
        loadExamPapers();
    };

    // Grouper les épreuves par année
    const examsByYear = useMemo(() => {
        const grouped = {};
        examPapers.forEach(paper => {
            const year = paper.exam_year || 'Non daté';
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(paper);
        });
        // Trier les années par ordre décroissant
        return Object.keys(grouped)
            .sort((a, b) => {
                if (a === 'Non daté') return 1;
                if (b === 'Non daté') return -1;
                return parseInt(b) - parseInt(a);
            })
            .reduce((acc, year) => {
                acc[year] = grouped[year];
                return acc;
            }, {});
    }, [examPapers]);

    // Calculer les statistiques
    const stats = useMemo(() => {
        const uniquePrograms = new Set(examPapers.map(p => p.program_id).filter(Boolean));
        const uniqueYears = new Set(examPapers.map(p => p.exam_year).filter(Boolean));
        return {
            total: examPapers.length,
            programs: uniquePrograms.size,
            years: uniqueYears.size,
        };
    }, [examPapers]);

    const handleDownload = async (examPaper) => {
        try {
            const response = await api.get(`/exams/${examPaper.id}/download`, {
                responseType: 'blob',
            });
            
            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', examPaper.file_name || `${examPaper.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Téléchargement démarré');
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            toast.error('Erreur lors du téléchargement');
        }
    };

    const handleView = (examPaper) => {
        // Ouvrir dans un nouvel onglet
        window.open(`/api/exams/${examPaper.id}/view`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête avec icône */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Anciennes Épreuves
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Télécharger gratuitement les examens des dernières années
                    </p>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    {/* Barre de recherche */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rechercher: Titre ou filière
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Rechercher une épreuve..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Statistiques et filtres */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Statistiques */}
                        <div className="flex gap-4 flex-1">
                            <div className="bg-green-600 text-white px-4 py-3 rounded-md">
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-sm">Épreuves disponible</div>
                            </div>
                            <div className="bg-green-600 text-white px-4 py-3 rounded-md">
                                <div className="text-2xl font-bold">{stats.programs}</div>
                                <div className="text-sm">Filières couvertes</div>
                            </div>
                            <div className="bg-green-600 text-white px-4 py-3 rounded-md">
                                <div className="text-2xl font-bold">{stats.years}</div>
                                <div className="text-sm">Années d'archive</div>
                            </div>
                        </div>

                        {/* Filtre par filière */}
                        <div className="flex gap-2 items-center">
                            <select
                                value={filters.program_id}
                                onChange={(e) => handleFilterChange('program_id', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Toutes les filières</option>
                                {availableFilters.programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Filtrer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Liste des épreuves organisées par année */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">Chargement des épreuves...</p>
                    </div>
                ) : examPapers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-gray-600 text-lg mb-2">
                            {filters.program_id || filters.search
                                ? "Aucune épreuve trouvée avec les critères sélectionnés."
                                : "Aucune épreuve disponible pour le moment."}
                        </p>
                        {(filters.program_id || filters.search) && (
                            <button
                                onClick={() => setFilters({ program_id: '', search: '' })}
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(examsByYear).map(([year, papers]) => (
                            <div key={year} className="bg-white rounded-lg shadow-sm p-6">
                                {/* En-tête de l'année */}
                                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Année {year}
                                        </h2>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        {papers.length} épreuve{papers.length > 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Cartes des épreuves */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {papers.map((paper) => (
                                        <div
                                            key={paper.id}
                                            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
                                        >
                                            {/* Icône document en haut à droite */}
                                            <div className="flex justify-end mb-2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>

                                            {/* Titre de l'épreuve */}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {paper.title}
                                            </h3>

                                            {/* Filière */}
                                            {paper.program_name && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {paper.program_name}
                                                </p>
                                            )}

                                            {/* Nombre de téléchargements */}
                                            <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span>{paper.download_count} Téléchargement{paper.download_count > 1 ? 's' : ''}</span>
                                            </div>

                                            {/* Bouton de téléchargement violet */}
                                            <button
                                                onClick={() => handleDownload(paper)}
                                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Téléchargement
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
