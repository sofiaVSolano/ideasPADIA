import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Lightbulb, ShieldAlert } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-shrink-0 items-center text-blue-600 gap-2">
                            <Lightbulb className="h-8 w-8" />
                            <span className="font-bold text-xl">IdeasPADIA</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <ShieldAlert className="h-4 w-4 mr-2" />
                                Admin Panel
                            </Link>
                        )}

                        <div className="flex items-center border-l bg-gray-100 px-4 py-1.5 rounded-full border-gray-200 ml-4">
                            <div className="text-sm">
                                <span className="font-semibold text-gray-800">{user?.name || user?.email}</span>
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-5 w-5" />
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;