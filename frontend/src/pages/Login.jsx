import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/login', {
                username: email, // OAuth2PasswordRequestForm usa form-data o raw
                password: password,
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' } // Requerimiento especifico de fastapi oauth2
            });

            const { access_token } = response.data;

            // Decodificar el JWT no es estrictamente necesario ya que podemos extraer el rol desde un endpoint 
            // pero para fines de demostración asumimos un jwt decode o endpoint /me.
            // Opcionalmente modifiquemos el endpoint login para que regrese también el user. 
            // Si el backend es fastapi estándar como el actual:
            const payload = JSON.parse(atob(access_token.split('.')[1]));

            login({ id: payload.sub, email, role: payload.role || 'user' }, access_token);
        } catch (err) {
            setError(err.response?.data?.detail || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-orange-600 mb-8">IdeasPADIA</h2>

                {error && <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white p-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿No tienes cuenta? <Link to="/register" className="text-orange-600 font-medium hover:underline">Regístrate</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;