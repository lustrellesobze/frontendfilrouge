import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import { store } from './store';
import './i18n/config'; // Initialiser i18n
import './styles/app.css';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import StudentDashboardLayout from './layouts/StudentDashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProgramManagerLayout from './layouts/ProgramManagerLayout';

// Public Pages
import Home from './Pages/Home';
import Arretes from './Pages/Arretes/Index';
import SitesIndex from './Pages/Sites/Index';
import ExamsIndex from './Pages/Exams/Index';
import FAQ from './Pages/FAQ';
import Contact from './Pages/Contact';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';

// Protected Pages
import Dashboard from './Pages/Dashboard';
import Notifications from './Pages/Notifications';
import Profile from './Pages/Profile';
import Chatbox from './Pages/Chatbox';
import Archives from './Pages/Archives';
import SimulationPlay from './Pages/Simulation/Play';
import Feedback from './Pages/Feedback';
import EnrollmentsCreate from './Pages/Enrollments/Create';
import EnrollmentsConfirmation from './Pages/Enrollments/Confirmation';
import EnrollmentsList from './Pages/Enrollments/List';
import EnrollmentsDossier from './Pages/Enrollments/Dossier';

// Admin Pages
import AdminDashboard from './Pages/Admin/Dashboard';
import AdminEnrollments from './Pages/Admin/Enrollments';
import AdminQuitus from './Pages/Admin/Quitus';
import AdminSessions from './Pages/Admin/Sessions';
import AdminEcoles from './Pages/Admin/Ecoles';
import AdminConcours from './Pages/Admin/Concours';
import AdminCentres from './Pages/Admin/Centres';
import AdminParametres from './Pages/Admin/Parametres';
import AdminProgramManagers from './Pages/Admin/ProgramManagers';
import AdminReports from './Pages/Admin/Reports';

// Program Manager (Responsable de filière) Pages
import ProgramManagerDashboard from './Pages/ProgramManager/Dashboard';
import ProgramManagerEnrollments from './Pages/ProgramManager/Enrollments';
import ProgramManagerReports from './Pages/ProgramManager/Reports';

function App() {
    const dispatch = useDispatch();
    const { isAuthenticated, user, token } = useSelector((state) => state.auth);

    useEffect(() => {
        // Vérifier l'authentification au chargement
        if (token && !user) {
            dispatch(getCurrentUser());
        }
    }, [token, user, dispatch]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AppLayout />}>
                <Route index element={
                    isAuthenticated && user?.roles?.some(role => 
                        (typeof role === 'object' && role.slug === 'responsable_filiere') || 
                        (typeof role === 'string' && role === 'responsable_filiere')
                    ) ? (
                        <Navigate to="/program-manager/dashboard" replace />
                    ) : (
                        <Home />
                    )
                } />
                <Route path="arretes" element={<Arretes />} />
                <Route path="sites" element={<SitesIndex />} />
                <Route path="exams" element={<ExamsIndex />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="contact" element={<Contact />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
                <Route 
                    path="login" 
                    element={
                        isAuthenticated ? (
                            user?.roles?.some(role => 
                                (typeof role === 'object' && role.slug === 'admin') || 
                                (typeof role === 'string' && role === 'admin')
                            ) ? (
                                <Navigate to="/admin/dashboard" replace />
                            ) : user?.roles?.some(role => 
                                (typeof role === 'object' && role.slug === 'responsable_filiere') || 
                                (typeof role === 'string' && role === 'responsable_filiere')
                            ) ? (
                                <Navigate to="/program-manager/dashboard" replace />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        ) : (
                            <Login />
                        )
                    } 
                />
                <Route 
                    path="register" 
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
                />
            </Route>

            {/* Protected Routes with Student Layout */}
            <Route 
                path="/dashboard" 
                element={
                    isAuthenticated ? <StudentDashboardLayout /> : <Navigate to="/auth/login" />
                }
            >
                <Route index element={<Dashboard />} />
            </Route>

            {/* Individual Protected Routes */}
            <Route 
                path="/notifications" 
                element={
                    isAuthenticated ? <StudentDashboardLayout /> : <Navigate to="/auth/login" />
                }
            >
                <Route index element={<Notifications />} />
            </Route>

            <Route 
                path="/profile" 
                element={
                    isAuthenticated ? <StudentDashboardLayout /> : <Navigate to="/auth/login" />
                }
            >
                <Route index element={<Profile />} />
            </Route>

            <Route 
                path="/chatbox" 
                element={
                    isAuthenticated ? <StudentDashboardLayout /> : <Navigate to="/auth/login" />
                }
            >
                <Route index element={<Chatbox />} />
            </Route>

            <Route 
                path="/archives" 
                element={
                    isAuthenticated ? <StudentDashboardLayout /> : <Navigate to="/auth/login" />
                }
            >
                <Route index element={<Archives />} />
                <Route path="simulation/:id" element={<SimulationPlay />} />
            </Route>

            <Route 
                path="/feedback" 
                element={
                    isAuthenticated ? <StudentDashboardLayout /> : <Navigate to="/auth/login" />
                }
            >
                <Route index element={<Feedback />} />
            </Route>

            {/* Enrollment Form - Standalone page (sans sidebar) */}
            <Route 
                path="/enrollments/create" 
                element={
                    isAuthenticated ? (
                        <AppLayout>
                            <EnrollmentsCreate />
                        </AppLayout>
                    ) : (
                        <Navigate to="/auth/login" replace />
                    )
                }
            />

            {/* Enrollment Confirmation - Standalone page */}
            <Route 
                path="/enrollments/:id/confirmation" 
                element={
                    isAuthenticated ? (
                        <AppLayout>
                            <EnrollmentsConfirmation />
                        </AppLayout>
                    ) : (
                        <Navigate to="/auth/login" replace />
                    )
                }
            />

            {/* Enrollment Routes avec Dashboard Layout (après soumission) */}
            <Route 
                path="/enrollments" 
                element={isAuthenticated ? <StudentDashboardLayout /> : <Navigate to="/auth/login" replace />}
            >
                <Route index element={<EnrollmentsList />} />
                <Route path="dossier" element={<EnrollmentsDossier />} />
            </Route>


            {/* Admin Routes */}
            <Route 
                path="/admin" 
                element={
                    isAuthenticated && user?.roles?.some(role => 
                        (typeof role === 'object' && role.slug === 'admin') || 
                        (typeof role === 'string' && role === 'admin')
                    ) ? (
                        <AdminLayout />
                    ) : (
                        <Navigate to="/auth/login" />
                    )
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="quitus" element={<AdminQuitus />} />
                <Route path="sessions" element={<AdminSessions />} />
                <Route path="ecoles" element={<AdminEcoles />} />
                <Route path="program-managers" element={<AdminProgramManagers />} />
                <Route path="concours" element={<AdminConcours />} />
                <Route path="competitions" element={<AdminConcours />} />
                <Route path="centres" element={<AdminCentres />} />
                <Route path="exam-centers" element={<AdminCentres />} />
                <Route path="depot-centers" element={<AdminCentres />} />
                <Route path="parametres" element={<AdminParametres />} />
                <Route path="dossier-settings" element={<AdminParametres />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* Responsable de filière (Program Manager) Routes */}
            <Route 
                path="/program-manager" 
                element={
                    isAuthenticated && user?.roles?.some(role => 
                        (typeof role === 'object' && role.slug === 'responsable_filiere') || 
                        (typeof role === 'string' && role === 'responsable_filiere')
                    ) ? (
                        <ProgramManagerLayout />
                    ) : (
                        <Navigate to="/auth/login" />
                    )
                }
            >
                <Route path="dashboard" element={<ProgramManagerDashboard />} />
                <Route path="enrollments" element={<ProgramManagerEnrollments />} />
                <Route path="reports" element={<ProgramManagerReports />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <Toaster position="top-right" />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
