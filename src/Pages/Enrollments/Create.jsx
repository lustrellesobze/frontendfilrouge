import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { autoSaveEnrollment, submitEnrollment, setCurrentEnrollment } from '../../store/slices/enrollmentSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EnrollmentsCreate() {
    const [searchParams] = useSearchParams();
    const level = searchParams.get('level') || 'first-year';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { currentEnrollment, saving } = useSelector((state) => state.enrollment);
    const { user, isAuthenticated, token } = useSelector((state) => state.auth);
    
    console.log('🚀 EnrollmentsCreate - Composant monté', { isAuthenticated, token: !!token });

    const [currentStep, setCurrentStep] = useState(1);
    const [regions, setRegions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [diplomes, setDiplomes] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [bacSeries, setBacSeries] = useState([]);
    const [mentions, setMentions] = useState([]);
    const [examCenters, setExamCenters] = useState([]);
    const [depotCenters, setDepotCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        try {
            console.log('📡 Début du chargement des données...');
            setError(null);
            setLoading(true);
            
            // Timeout de sécurité : si le chargement prend plus de 30 secondes, arrêter
            const timeoutId = setTimeout(() => {
                console.warn('⏱️ Timeout: Le chargement prend trop de temps');
                setError('Le chargement prend trop de temps. Vérifiez votre connexion.');
                setLoading(false);
            }, 30000);
            
            const [
                regionsRes, 
                departmentsRes, 
                diplomesRes, 
                programsRes, 
                bacSeriesRes, 
                mentionsRes, 
                examCentersRes,
                depotCentersRes
            ] = await Promise.all([
                api.get('/regions').catch(err => {
                    console.error('❌ Erreur regions:', err);
                    console.error('Détails:', err.response?.data || err.message);
                    console.error('Status:', err.response?.status);
                    // Retourner une structure vide pour éviter les erreurs
                    return { data: { data: [], error: err.response?.data?.message || err.message } };
                }),
                api.get('/departments').catch(err => {
                    console.warn('⚠️ Erreur departments:', err);
                    return { data: { data: [] } };
                }),
                api.get('/diplomes?is_active=1').catch(err => {
                    console.warn('⚠️ Erreur diplomes:', err);
                    return { data: { data: [] } };
                }),
                api.get('/programs').catch(err => {
                    console.warn('⚠️ Erreur programs:', err);
                    return { data: { data: [] } };
                }),
                api.get('/bac-series?is_active=1').catch(err => {
                    console.warn('⚠️ Erreur bac-series:', err);
                    return { data: { data: [] } };
                }),
                api.get('/mentions?is_active=1').catch(err => {
                    console.warn('⚠️ Erreur mentions:', err);
                    return { data: { data: [] } };
                }),
                api.get('/exam-centers?status=active').catch(err => {
                    console.warn('⚠️ Erreur exam-centers:', err);
                    return { data: { data: [] } };
                }),
                api.get('/centre-depots?is_active=1').catch(err => {
                    console.warn('⚠️ Erreur centre-depots:', err);
                    return { data: { data: [] } };
                }),
            ]);

            clearTimeout(timeoutId);

            console.log('✅ Données chargées:', {
                regions: regionsRes.data?.data?.length || 0,
                departments: departmentsRes.data?.data?.length || 0,
                diplomes: diplomesRes.data?.data?.length || 0,
                programs: programsRes.data?.data?.length || 0,
            });

            // Vérifier les erreurs et afficher des messages plus clairs
            if (regionsRes.data?.error || regionsRes.data?.message) {
                console.error('❌ Erreur API regions:', regionsRes.data.error || regionsRes.data.message);
                const errorMsg = regionsRes.data.message || regionsRes.data.error || 'Erreur lors du chargement des régions';
                toast.error(errorMsg, { duration: 5000 });
            }

            // Extraire les données de la réponse API
            let regionsData = [];
            if (regionsRes.data) {
                // La réponse peut être { data: [...] } ou directement [...]
                regionsData = regionsRes.data.data || regionsRes.data;
                // S'assurer que c'est un tableau
                if (!Array.isArray(regionsData)) {
                    regionsData = [];
                }
            }
            
            console.log('📊 Régions reçues:', {
                length: regionsData.length,
                rawResponse: regionsRes.data,
                extractedData: regionsData,
                firstRegion: regionsData[0]
            });
            
            if (regionsData.length > 0) {
                // S'assurer que les IDs sont des nombres pour la comparaison
                const normalizedRegions = regionsData.map(region => ({
                    ...region,
                    id: parseInt(region.id) || region.id
                }));
                setRegions(normalizedRegions);
                console.log('✅ Régions chargées avec succès:', normalizedRegions.map(r => `${r.id}: ${r.name}`).join(', '));
            } else {
                console.warn('⚠️ Aucune région trouvée dans la réponse API', {
                    response: regionsRes.data,
                    hasError: !!regionsRes.data?.error,
                    hasMessage: !!regionsRes.data?.message
                });
                setRegions([]);
                // Ne pas afficher d'erreur si c'est juste une liste vide (peut être normal)
                if (!regionsRes.data?.error) {
                    toast.error('Aucune région disponible. Veuillez vérifier que les données sont bien dans la base de données.', { duration: 5000 });
                }
            }
            // Ne pas charger tous les départements au début, ils seront chargés dynamiquement par région
            setDepartments([]);
            setDiplomes(diplomesRes.data?.data || diplomesRes.data || []);
            // Ne pas charger tous les programmes au début, ils seront chargés dynamiquement selon diplôme et série
            setPrograms([]);
            setBacSeries(bacSeriesRes.data?.data || bacSeriesRes.data || []);
            setMentions(mentionsRes.data?.data || mentionsRes.data || []);
            setExamCenters(examCentersRes.data?.data || examCentersRes.data || []);
            setDepotCenters(depotCentersRes.data?.data || depotCentersRes.data || []);
            
            console.log('✅ Chargement terminé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            setError('Erreur lors du chargement des données. Veuillez rafraîchir la page.');
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
            console.log('🏁 État de chargement: false');
        }
    };

    // Rediriger si non authentifié et charger les données
    useEffect(() => {
        console.log('🔍 EnrollmentsCreate - Auth check:', { 
            isAuthenticated, 
            token: !!token, 
            user: !!user,
            hasLoadData: typeof loadData === 'function'
        });
        
        if (!isAuthenticated || !token) {
            console.log('❌ Non authentifié, redirection vers login');
            toast.error('Veuillez vous connecter pour accéder à cette page');
            navigate('/auth/login', { replace: true });
            return;
        }
        
        // Charger les données seulement si authentifié
        console.log('✅ Authentifié, chargement des données...');
        if (typeof loadData === 'function') {
            loadData();
        } else {
            console.error('❌ loadData n\'est pas une fonction!');
            setError('Erreur d\'initialisation. Veuillez rafraîchir la page.');
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, token, navigate]);

    const totalSteps = 4; // 4 étapes : Personnelles, Académiques, Familiales, Récapitulatif

    const [formData, setFormData] = useState({
        // Étape 1: Informations personnelles
        last_name: '',
        first_name: '',
        email: user?.email || '',
        phone: user?.phone || '',
        birth_date: '',
        birth_place: '', // Lieu de naissance
        residence: '',
        region_id: '',
        department_id: '',
        gender: '',
        national_id: user?.national_id || '',
        preferred_language: 'french', // 1ère Langue: français ou anglais
        photo: null,
        id_or_birth_certificate: null,
        // Étape 2: Informations académiques
        diplome_id: '',
        program_id: '',
        bac_serie_id: '',
        mention_id: '',
        diploma_year: '',
        institution: '',
        exam_center_id: '',
        depot_center_id: '',
        diploma_file: null,
        // Étape 3: Informations familiales
        guardian_name: '',
        guardian_phone: '',
        guardian_relationship: '',
        guardian_address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
    });

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [type]: file
            }));
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        
        if (currentStep === 1) {
            // Validation étape 1
            if (!formData.last_name || !formData.first_name || !formData.email || !formData.phone || !formData.birth_date || !formData.photo || !formData.id_or_birth_certificate) {
                toast.error('Veuillez remplir tous les champs obligatoires');
                return;
            }
        } else if (currentStep === 2) {
            // Validation étape 2 (pas de required sur les file inputs pour permettre "Suivant" après Modifier depuis l'étape 4)
            if (!formData.diplome_id || !formData.program_id || !formData.exam_center_id || !formData.depot_center_id) {
                toast.error('Veuillez remplir tous les champs obligatoires');
                return;
            }
            if (!formData.diploma_file) {
                toast.error('Veuillez téléverser le diplôme');
                return;
            }
        } else if (currentStep === 3) {
            // Validation étape 3
            if (!formData.guardian_name || !formData.guardian_phone || !formData.emergency_contact_name || !formData.emergency_contact_phone) {
                toast.error('Veuillez remplir tous les champs obligatoires');
                return;
            }
        }
        
        setCurrentStep(currentStep + 1);
    };

    const handleEditStep = (step) => {
        setCurrentStep(step);
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSubmit = async () => {
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        
        try {
            // Créer le profil étudiant si nécessaire
            const studentData = {
                user_id: user.id,
                gender: formData.gender,
                birth_date: formData.birth_date,
                birth_place: formData.birth_place, // Lieu de naissance
                address: formData.residence,
                phone: formData.phone,
                guardian_name: formData.guardian_name,
                guardian_phone: formData.guardian_phone,
            };

            // Créer ou mettre à jour le profil étudiant
            let studentResponse;
            try {
                studentResponse = await api.post('/students', studentData);
            } catch (error) {
                // Si l'étudiant existe déjà, le mettre à jour
                if (error.response?.status === 422 || error.response?.status === 409) {
                    const studentId = user.student?.id;
                    if (studentId) {
                        studentResponse = await api.put(`/students/${studentId}`, studentData);
                    }
                } else {
                    throw error;
                }
            }

            const student = studentResponse.data.data || studentResponse.data;

            // Valider le format CNI si renseigné (CNIEU + 3 chiffres)
            const cniVal = (formData.national_id || '').trim().toUpperCase();
            if (cniVal) {
                const validCni = /^CNIEU\d{3}$/.test(cniVal) || (/^\d{3}$/.test(cniVal));
                if (!validCni) {
                    toast.error('Le numéro de CNI doit être au format CNIEU suivi de 3 chiffres (ex: CNIEU123).');
                    return;
                }
            }

            // Normaliser la CNI pour l'envoi (CNIEU + 3 chiffres)
            let nationalIdToSend = formData.national_id ? formData.national_id.trim().toUpperCase() : null;
            if (nationalIdToSend && /^\d{3}$/.test(nationalIdToSend)) nationalIdToSend = `CNIEU${nationalIdToSend}`;
            if (nationalIdToSend && !/^CNIEU\d{3}$/.test(nationalIdToSend)) nationalIdToSend = null;

            // Créer l'enrôlement avec preferred_language dans metadata
            const enrollmentData = {
                student_id: student.id,
                program_id: formData.program_id,
                exam_center_id: formData.exam_center_id,
                centre_depot_id: formData.depot_center_id,
                diplome_id: formData.diplome_id,
                bac_serie_id: formData.bac_serie_id,
                mention_id: formData.mention_id,
                diploma_year: formData.diploma_year, // Année du diplôme
                status: 'pending', // En attente jusqu'à validation par le responsable de filière
                national_id: nationalIdToSend,
                metadata: {
                    preferred_language: formData.preferred_language,
                    guardian_relationship: formData.guardian_relationship,
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                    emergency_contact_relationship: formData.emergency_contact_relationship,
                    numero_cni: nationalIdToSend || null,
                },
            };

            const enrollmentResponse = await api.post('/enrollments', enrollmentData);
            const enrollmentId = enrollmentResponse.data.id || enrollmentResponse.data.data?.id;

            // Envoyer la photo (informations personnelles) et les autres documents pour la fiche d'inscription
            const uploadDoc = async (file, type, title) => {
                if (!file || !(file instanceof File)) return;
                const fd = new FormData();
                fd.append('file', file);
                fd.append('enrollment_id', String(enrollmentId));
                fd.append('type', type);
                if (title) fd.append('title', title);
                // Laisser axios définir Content-Type pour FormData (multipart/form-data + boundary)
                const uploadHeaders = { ...api.defaults.headers?.common };
                delete uploadHeaders['Content-Type'];
                await api.post('/enrollment-documents/upload', fd, { headers: uploadHeaders });
            };
            try {
                if (formData.photo) await uploadDoc(formData.photo, 'photo', 'Photo candidat');
                if (formData.id_or_birth_certificate) await uploadDoc(formData.id_or_birth_certificate, 'acte_naissance', 'Acte de naissance / CNI');
                if (formData.diploma_file) await uploadDoc(formData.diploma_file, 'diplome', 'Diplôme');
            } catch (uploadErr) {
                const msg = uploadErr.response?.data?.message || uploadErr.response?.data?.error || uploadErr.message;
                console.warn('Upload document(s) failed:', uploadErr.response?.data || uploadErr);
                toast.error(msg || 'Dossier enregistré mais un document n\'a pas pu être joint. Vous pourrez le déposer plus tard.');
            }

            toast.success('Dossier soumis avec succès !');
            navigate(`/enrollments/${enrollmentId}/confirmation`);
        } catch (error) {
            console.error('Erreur soumission:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la soumission du dossier';
            
            // Gestion spécifique pour les erreurs de contrainte unique
            if (error.response?.status === 409) {
                toast.error(errorMessage, { duration: 5000 });
            } else if (error.response?.data?.field) {
                toast.error(`${errorMessage} (${error.response.data.field})`, { duration: 5000 });
            } else {
                toast.error(errorMessage, { duration: 4000 });
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Charger les départements quand une région est sélectionnée
    useEffect(() => {
        const loadDepartments = async () => {
            if (formData.region_id) {
                try {
                    console.log('🔄 Chargement des départements pour la région:', formData.region_id);
                    const response = await api.get(`/departments?region_id=${formData.region_id}&status=active`);
                    
                    // Extraire les données de la réponse API
                    let departmentsData = [];
                    if (response.data) {
                        departmentsData = response.data.data || response.data;
                        if (!Array.isArray(departmentsData)) {
                            departmentsData = [];
                        }
                    }
                    
                    // Normaliser les IDs
                    const normalizedDepartments = departmentsData.map(dept => ({
                        ...dept,
                        id: parseInt(dept.id) || dept.id,
                        region_id: parseInt(dept.region_id) || dept.region_id
                    }));
                    
                    console.log('✅ Départements chargés:', {
                        length: normalizedDepartments.length,
                        rawResponse: response.data,
                        extractedData: normalizedDepartments,
                        firstDept: normalizedDepartments[0]
                    });
                    
                    setDepartments(normalizedDepartments);
                    
                    // Si aucun département trouvé, afficher un message
                    if (normalizedDepartments.length === 0) {
                        console.warn('⚠️ Aucun département trouvé pour cette région', {
                            regionId: formData.region_id,
                            response: response.data
                        });
                        toast.error('Aucun département disponible pour cette région', { duration: 3000 });
                    }
                } catch (error) {
                    console.error('❌ Erreur chargement départements:', error);
                    console.error('Détails:', error.response?.data || error.message);
                    setDepartments([]);
                    toast.error('Erreur lors du chargement des départements', { duration: 3000 });
                }
            } else {
                setDepartments([]);
            }
        };
        loadDepartments();
    }, [formData.region_id]);

    // Charger les programmes quand un diplôme ET une série sont sélectionnés
    useEffect(() => {
        const loadPrograms = async () => {
            // Ne charger que si les deux sont sélectionnés
            if (formData.diplome_id && formData.bac_serie_id) {
                try {
                    console.log('🔄 Chargement des programmes pour:', {
                        diplome_id: formData.diplome_id,
                        bac_serie_id: formData.bac_serie_id
                    });
                    
                    const response = await api.get(`/programs?diplome_id=${formData.diplome_id}&bac_serie_id=${formData.bac_serie_id}&status=active`);
                    
                    // Extraire les données de la réponse API
                    let programsData = [];
                    if (response.data) {
                        programsData = response.data.data || response.data;
                        if (!Array.isArray(programsData)) {
                            programsData = [];
                        }
                    }
                    
                    // Normaliser les IDs
                    const normalizedPrograms = programsData.map(prog => ({
                        ...prog,
                        id: parseInt(prog.id) || prog.id
                    }));
                    
                    console.log('✅ Programmes chargés:', {
                        length: normalizedPrograms.length,
                        programs: normalizedPrograms.map(p => p.name)
                    });
                    
                    setPrograms(normalizedPrograms);
                    
                    // Réinitialiser la sélection de programme si le programme actuel n'est plus dans la liste
                    if (formData.program_id && !normalizedPrograms.find(p => p.id === parseInt(formData.program_id))) {
                        setFormData(prev => ({ ...prev, program_id: '' }));
                    }
                    
                    // Si aucun programme trouvé, afficher un message
                    if (normalizedPrograms.length === 0) {
                        console.warn('⚠️ Aucun programme trouvé pour cette combinaison diplôme/série');
                        toast.error('Aucune filière disponible pour cette combinaison de diplôme et série', { duration: 4000 });
                    }
                } catch (error) {
                    console.error('❌ Erreur chargement programmes:', error);
                    console.error('Détails:', error.response?.data || error.message);
                    setPrograms([]);
                    toast.error('Erreur lors du chargement des filières', { duration: 3000 });
                }
            } else {
                // Réinitialiser la liste des programmes si diplôme ou série n'est pas sélectionné
                setPrograms([]);
                if (formData.program_id) {
                    setFormData(prev => ({ ...prev, program_id: '' }));
                }
            }
        };
        loadPrograms();
    }, [formData.diplome_id, formData.bac_serie_id]);

    const handleCancel = () => {
        if (window.confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données non sauvegardées seront perdues.')) {
            navigate('/');
        }
    };

    // Générer un numéro de quittance (exemple: XXXXX)
    const generateQuittanceNumber = () => {
        return user?.quitus_number || 'XXXXX';
    };

    // Obtenir l'année académique actuelle
    const getAcademicYear = () => {
        const currentYear = new Date().getFullYear();
        return `${currentYear}-${currentYear + 1}`;
    };

    // Si non authentifié, ne rien afficher (redirection en cours)
    if (!isAuthenticated || !token) {
        console.log('⚠️ Rendu: Non authentifié, affichage du loader de redirection');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-600">Redirection vers la page de connexion...</p>
                    <p className="text-xs text-gray-400 mt-2">Si cette page persiste, vérifiez votre connexion.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        console.log('⏳ Rendu: État de chargement, affichage du loader');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-600">Chargement des données...</p>
                    <p className="text-xs text-gray-400 mt-2">Veuillez patienter...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            loadData();
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Debug: s'assurer que le composant arrive jusqu'ici
    console.log('🎨 Rendu du formulaire d\'enrollment', { 
        loading, 
        error, 
        hasRegions: regions.length > 0,
        currentStep,
        isAuthenticated,
        token: !!token,
        user: !!user
    });

    // S'assurer qu'on retourne toujours quelque chose - double vérification
    if (!isAuthenticated || !token) {
        console.log('⚠️ Double vérification: Non authentifié');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-600">Redirection vers la page de connexion...</p>
                </div>
            </div>
        );
    }

    // Si on arrive ici, on doit afficher le formulaire
    console.log('✅ Affichage du formulaire d\'enrollment');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header avec SGEE et Retour */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">SGEE</span>
                    </div>
                    <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Bande verte avec titre et informations */}
                <div className="bg-green-600 text-white rounded-t-lg p-6 mb-0">
                    <h1 className="text-2xl font-bold mb-4">Formulaire d'enrollement</h1>
                    <div className="space-y-1 text-sm">
                        <p>Numéro quittance: {generateQuittanceNumber()}</p>
                        <p>Année académique: {getAcademicYear()}</p>
                    </div>
                </div>

                {/* Barre de progression - 3 lignes */}
                <div className="bg-white px-6 py-4 border-x border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{currentStep}/{totalSteps}</span>
                    </div>
                    <div className="flex gap-2">
                        <div className={`flex-1 h-1 rounded ${currentStep >= 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex-1 h-1 rounded ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex-1 h-1 rounded ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                        <div className={`flex-1 h-1 rounded ${currentStep >= 4 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    </div>
                </div>

                {/* Formulaire */}
                <div className="bg-white rounded-b-lg shadow-lg p-6 border-x border-b border-gray-200">
                    {currentStep === 1 && (
                        <form onSubmit={handleNext} className="space-y-6">
                            {/* Section Informations personnelles */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Informations personnelles</h2>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nom *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Nom de famille"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Prénom *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Prénom(s)"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="youremail@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Téléphone *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="+237XXXXXXXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Âge *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                required
                                                value={formData.birth_date}
                                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="JJ/MM/AAAA"
                                            />
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lieu de résidence
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.residence}
                                            onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Lieu de résidence"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Région d'origine *
                                            </label>
                                            <p className="text-xs text-gray-500 mb-1">Choisissez votre région (ex. Adamaoua, Centre, Littoral…)</p>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={formData.region_id}
                                                    onChange={(e) => {
                                                        const regionId = e.target.value;
                                                        setFormData({ ...formData, region_id: regionId, department_id: '' });
                                                    }}
                                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer"
                                                    style={{ 
                                                        appearance: 'menulist',
                                                        WebkitAppearance: 'menulist',
                                                        MozAppearance: 'menulist'
                                                    }}
                                                >
                                                    <option value="">
                                                        {regions.length === 0 ? 'Aucune région disponible' : 'Sélectionnez une région'}
                                                    </option>
                                                    {regions.map(region => {
                                                        const regionId = region.id ? String(region.id) : '';
                                                        return (
                                                            <option key={regionId} value={regionId}>
                                                                {region.name || `Région ${regionId}`}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Département d'origine *
                                            </label>
                                            <p className="text-xs text-gray-500 mb-1">
                                                {formData.region_id
                                                    ? `Départements de la région ${regions.find(r => String(r.id) === formData.region_id)?.name || 'sélectionnée'} uniquement`
                                                    : 'Sélectionnez d\'abord une région pour afficher ses départements'}
                                            </p>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={formData.department_id}
                                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                                    className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                        !formData.region_id || departments.length === 0 
                                                            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                                            : 'bg-white cursor-pointer'
                                                    }`}
                                                    disabled={!formData.region_id || departments.length === 0}
                                                    style={{ 
                                                        appearance: (!formData.region_id || departments.length === 0) ? 'none' : 'menulist',
                                                        WebkitAppearance: (!formData.region_id || departments.length === 0) ? 'none' : 'menulist',
                                                        MozAppearance: (!formData.region_id || departments.length === 0) ? 'none' : 'menulist'
                                                    }}
                                                >
                                                    <option value="">
                                                        {!formData.region_id 
                                                            ? 'Sélectionnez d\'abord une région' 
                                                            : departments.length === 0 
                                                            ? 'Aucun département pour cette région' 
                                                            : 'Sélectionnez un département'}
                                                    </option>
                                                    {departments.map(dept => {
                                                        const deptId = dept.id ? String(dept.id) : '';
                                                        return (
                                                            <option key={deptId} value={deptId}>
                                                                {dept.name || `Département ${deptId}`}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                            {formData.region_id && departments.length === 0 && (
                                                <p className="mt-1 text-xs text-yellow-600">
                                                    Chargement des départements...
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sexe *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                            >
                                                <option value="">Sélectionnez</option>
                                                <option value="male">Masculin</option>
                                                <option value="female">Féminin</option>
                                                <option value="other">Autre</option>
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            N° CNI (format CNIEU + 3 chiffres)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.national_id}
                                            onChange={(e) => setFormData({ ...formData, national_id: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                                            placeholder="ex: CNIEU123"
                                            maxLength={8}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Exemple : CNIEU123 (CNIEU suivi de 3 chiffres)</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lieu de naissance *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.birth_place}
                                            onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Ville de naissance"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            1ère Langue *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.preferred_language}
                                                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                            >
                                                <option value="french">Français</option>
                                                <option value="english">Anglais</option>
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Si vous choisissez Français, votre fiche sera générée en Anglais (et vice-versa)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Téléversement de documents */}
                            <div className="pt-6 border-t border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Téléversement de documents</h2>
                                
                                <div className="space-y-4">
                                    {/* Photo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Photo *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, 'photo')}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label htmlFor="photo-upload" className="cursor-pointer">
                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="text-gray-600 font-medium">Téléverser</span>
                                                {formData.photo && (
                                                    <p className="text-sm text-green-600 mt-2">{formData.photo.name}</p>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {/* CNI / ACTE de naissance */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CNI / ACTE de naissance *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileUpload(e, 'id_or_birth_certificate')}
                                                className="hidden"
                                                id="document-upload"
                                            />
                                            <label htmlFor="document-upload" className="cursor-pointer">
                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="text-gray-600 font-medium">Téléverser</span>
                                                {formData.id_or_birth_certificate && (
                                                    <p className="text-sm text-green-600 mt-2">{formData.id_or_birth_certificate.name}</p>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons de navigation */}
                            <div className="flex justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 bg-purple-200 text-purple-700 rounded-lg font-medium hover:bg-purple-300 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    Suivant
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Étape 2: Informations académiques */}
                    {currentStep === 2 && (
                        <form onSubmit={handleNext} className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations académique</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Colonne gauche */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Diplôme *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.diplome_id}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, diplome_id: e.target.value, program_id: '' });
                                                }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                            >
                                                <option value="">Sélectionnez un diplôme</option>
                                                {diplomes.map(diplome => (
                                                    <option key={diplome.id} value={diplome.id}>{diplome.libelle}</option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Série *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.bac_serie_id}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, bac_serie_id: e.target.value, program_id: '' });
                                                }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                            >
                                                <option value="">Sélectionnez une série</option>
                                                {bacSeries.map(serie => (
                                                    <option key={serie.id} value={serie.id}>{serie.libelle}</option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Filière *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.program_id}
                                                onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                                                disabled={!formData.diplome_id || !formData.bac_serie_id || programs.length === 0}
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none ${
                                                    !formData.diplome_id || !formData.bac_serie_id || programs.length === 0
                                                        ? 'bg-gray-100 cursor-not-allowed opacity-60'
                                                        : 'bg-white cursor-pointer'
                                                }`}
                                            >
                                                <option value="">
                                                    {!formData.diplome_id || !formData.bac_serie_id
                                                        ? 'Sélectionnez d\'abord un diplôme et une série'
                                                        : programs.length === 0
                                                        ? 'Aucune filière disponible pour cette combinaison'
                                                        : 'Sélectionnez une filière'}
                                                </option>
                                                {programs.map(program => (
                                                    <option key={program.id} value={program.id}>{program.name}</option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        {formData.diplome_id && formData.bac_serie_id && programs.length === 0 && (
                                            <p className="mt-1 text-xs text-yellow-600">
                                                Chargement des filières ou aucune filière disponible pour cette combinaison...
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Année d'obtention du diplôme *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                required
                                                value={formData.diploma_year}
                                                onChange={(e) => setFormData({ ...formData, diploma_year: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="JJ/MM/AAAA"
                                            />
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Centre d'examen *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.exam_center_id}
                                                onChange={(e) => setFormData({ ...formData, exam_center_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                            >
                                                <option value="">Sélectionnez un centre</option>
                                                {examCenters.map(center => (
                                                    <option key={center.id} value={center.id}>{center.name} - {center.city}</option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diplôme *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileUpload(e, 'diploma_file')}
                                                className="hidden"
                                                id="diploma-upload"
                                            />
                                            <label htmlFor="diploma-upload" className="cursor-pointer">
                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="text-gray-600 font-medium">Téléverser</span>
                                                {formData.diploma_file && (
                                                    <p className="text-sm text-green-600 mt-2">{formData.diploma_file.name}</p>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne droite */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mention *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.mention_id}
                                                onChange={(e) => setFormData({ ...formData, mention_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                            >
                                                <option value="">Sélectionnez une mention</option>
                                                {mentions.map(mention => (
                                                    <option key={mention.id} value={mention.id}>{mention.libelle}</option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Établissement
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.institution}
                                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Nom de l'établissement"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Centre de dépôt *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.depot_center_id}
                                                onChange={(e) => setFormData({ ...formData, depot_center_id: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                            >
                                                <option value="">Sélectionnez un centre</option>
                                                {depotCenters.map(center => (
                                                    <option key={center.id} value={center.id}>{center.nom} - {center.ville}</option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons de navigation */}
                            <div className="flex justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Précédent
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    Suivant
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Étape 3: Informations familiales */}
                    {currentStep === 3 && (
                        <form onSubmit={handleNext} className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations familiales</h2>
                            
                            <div className="space-y-6">
                                {/* Informations du tuteur/parent */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tuteur / Parent</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nom complet du tuteur/parent *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.guardian_name}
                                                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Nom et prénom"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.guardian_phone}
                                                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="+237XXXXXXXXX"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lien de parenté *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={formData.guardian_relationship}
                                                    onChange={(e) => setFormData({ ...formData, guardian_relationship: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                                                >
                                                    <option value="">Sélectionnez</option>
                                                    <option value="father">Père</option>
                                                    <option value="mother">Mère</option>
                                                    <option value="uncle">Oncle</option>
                                                    <option value="aunt">Tante</option>
                                                    <option value="brother">Frère</option>
                                                    <option value="sister">Sœur</option>
                                                    <option value="other">Autre</option>
                                                </select>
                                                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Adresse
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.guardian_address}
                                                onChange={(e) => setFormData({ ...formData, guardian_address: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Adresse complète"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact d'urgence */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact d'urgence</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nom complet *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.emergency_contact_name}
                                                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Nom et prénom"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Téléphone *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.emergency_contact_phone}
                                                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="+237XXXXXXXXX"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lien / Relation *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.emergency_contact_relationship}
                                                onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                placeholder="Ex: Ami, Cousin, etc."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons de navigation */}
                            <div className="flex justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Précédent
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    Suivant
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Étape 4: Récapitulatif et validation */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Veuillez vérifier attentivement toutes vos informations.</strong> Vous pourrez les modifier avant de soumettre votre dossier.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif de votre dossier</h2>
                            
                            {/* Section 1: Informations personnelles */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">1. Informations personnelles</h3>
                                    <button
                                        onClick={() => handleEditStep(1)}
                                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Modifier
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Nom :</span>
                                        <span className="ml-2 font-medium">{formData.last_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Prénom :</span>
                                        <span className="ml-2 font-medium">{formData.first_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Email :</span>
                                        <span className="ml-2 font-medium">{formData.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Téléphone :</span>
                                        <span className="ml-2 font-medium">{formData.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Date de naissance :</span>
                                        <span className="ml-2 font-medium">{formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('fr-FR') : '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sexe :</span>
                                        <span className="ml-2 font-medium">{formData.gender === 'male' ? 'Masculin' : formData.gender === 'female' ? 'Féminin' : '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">N° CNI :</span>
                                        <span className="ml-2 font-medium">{formData.national_id || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Lieu de résidence :</span>
                                        <span className="ml-2 font-medium">{formData.residence || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Informations académiques */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">2. Informations académiques</h3>
                                    <button
                                        onClick={() => handleEditStep(2)}
                                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Modifier
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Filière :</span>
                                        <span className="ml-2 font-medium">
                                            {programs.find(p => p.id === parseInt(formData.program_id))?.name || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Centre d'examen :</span>
                                        <span className="ml-2 font-medium">
                                            {examCenters.find(c => c.id === parseInt(formData.exam_center_id))?.name || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Centre de dépôt :</span>
                                        <span className="ml-2 font-medium">
                                            {depotCenters.find(c => c.id === parseInt(formData.depot_center_id))?.nom || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Établissement :</span>
                                        <span className="ml-2 font-medium">{formData.institution || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Informations familiales */}
                            <div className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">3. Informations familiales</h3>
                                    <button
                                        onClick={() => handleEditStep(3)}
                                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Modifier
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Tuteur/Parent :</span>
                                        <span className="ml-2 font-medium">{formData.guardian_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Téléphone tuteur :</span>
                                        <span className="ml-2 font-medium">{formData.guardian_phone || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Lien de parenté :</span>
                                        <span className="ml-2 font-medium">{formData.guardian_relationship || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Contact d'urgence :</span>
                                        <span className="ml-2 font-medium">{formData.emergency_contact_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Téléphone urgence :</span>
                                        <span className="ml-2 font-medium">{formData.emergency_contact_phone || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons de navigation */}
                            <div className="flex justify-between pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Précédent
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Soumettre mon dossier
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Confirmation de soumission</h3>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-700 mb-3">
                                <strong className="text-red-600">⚠️ ATTENTION : Cette action est irréversible.</strong>
                            </p>
                            <p className="text-gray-700 mb-2">
                                Veuillez vérifier toutes vos informations avant de soumettre votre dossier.
                            </p>
                            <p className="text-gray-700">
                                Une fois soumis, vous ne pourrez plus modifier votre dossier.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmSubmit}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Confirmer la soumission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
