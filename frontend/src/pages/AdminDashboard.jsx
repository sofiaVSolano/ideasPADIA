import { useState, useEffect } from 'react';
import { adminService } from '../api/services';
import { Users, Lightbulb, Workflow, AlertCircle, BarChart3, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        total_ideas: 0,
        total_projects: 0,
        total_users: 0,
        ideas_by_status: {},
        top_projects: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await adminService.getMetrics();
                setStats(res.data);
            } catch (err) {
                setError('Error cargando métricas. Tal vez no eres admin.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    if (loading) return <div className="text-center py-20 text-gray-500 font-bold animate-pulse">Cargando panel de administración...</div>;
    if (error) return <div className="text-center py-20 text-red-500 font-bold flex flex-col items-center"><AlertCircle className="mb-4 h-12 w-12 text-red-400" /> {error}</div>;

    const statCards = [
        { title: 'Total Ideas', value: stats.total_ideas, icon: <Lightbulb className="h-8 w-8 text-yellow-500" />, bg: 'bg-yellow-50', border: 'border-yellow-200' },
        { title: 'Proyectos Activos', value: stats.total_projects, icon: <Workflow className="h-8 w-8 text-blue-500" />, bg: 'bg-blue-50', border: 'border-blue-200' },
        { title: 'Usuarios Registrados', value: stats.total_users, icon: <Users className="h-8 w-8 text-green-500" />, bg: 'bg-green-50', border: 'border-green-200' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    <Database className="h-8 w-8 mr-4 text-purple-600" />
                    Panel de Administración
                </h1>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Modo Vista Global</span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className={`${stat.bg} ${stat.border} border p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition`}>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.title}</p>
                            <h3 className="text-4xl font-extrabold text-gray-900">{stat.value}</h3>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ideas por Estado */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-3 text-indigo-500" /> Distribución de Ideas
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(stats.ideas_by_status).map(([status, count]) => (
                            <div key={status} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                <span className="font-semibold text-gray-700 capitalize text-sm">{status}</span>
                                <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full text-xs">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Proyectos Votados */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Workflow className="h-5 w-5 mr-3 text-pink-500" /> Proyectos Destacados (Votos)
                    </h3>
                    {stats.top_projects?.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10 bg-gray-50 rounded-xl border border-dashed">Sin proyectos aún</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.top_projects.map(proj => (
                                <div key={proj.id} className="border border-gray-100 p-4 rounded-xl flex justify-between items-center hover:border-pink-200 transition bg-white shadow-sm hover:shadow">
                                    <div>
                                        <p className="font-bold text-gray-900 mb-1">{proj.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{proj.description}</p>
                                    </div>
                                    <div className="flex flex-col items-center bg-pink-50 px-4 py-2 rounded-lg border border-pink-100">
                                        <span className="text-xl font-extrabold text-pink-600">{proj.votes}</span>
                                        <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">votos</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard