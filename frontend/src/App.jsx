import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
// Importaciones futuras (las comentamos para que no caiga la app mientras las construimos)
import CreateIdea from './pages/CreateIdea';
import IdeaDetail from './pages/IdeaDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Rutas Protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Navigate to="/" replace />} />

                            <Route path="/ideas/crear" element={<CreateIdea />} />
                            <Route path="/ideas/:id" element={<IdeaDetail />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>
                    </Route>

                    {/* Rutas Exclusivas Administradores */}
                    {/* <Route element={<AdminRoute />}> */}
                    {/* <Route element={<Layout />}> */}
                    {/* <Route path="/admin" element={<AdminDashboard />} /> */}
                    {/* </Route> */}
                    {/* </Route> */}

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;