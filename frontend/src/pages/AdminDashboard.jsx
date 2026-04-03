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
        top_projects: [],
        users: [],
        ideas: [],
        projects: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, ideas, projects, users

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
    if (error) return <div className="text-center py-20 text-orange-500 font-bold flex flex-col items-center"><AlertCircle className="mb-4 h-12 w-12 text-orange-400" /> {error}</div>;

    const statCards = [
        { id: 'ideas', title: 'Total Ideas', value: stats.total_ideas, icon: <Lightbulb className="h-8 w-8 text-orange-500" />, bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'projects', title: 'Proyectos Activos', value: stats.total_projects, icon: <Workflow className="h-8 w-8 text-orange-500" />, bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'users', title: 'Usuarios Registrados', value: stats.total_users, icon: <Users className="h-8 w-8 text-orange-500" />, bg: 'bg-orange-50', border: 'border-orange-200' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    <Database className="h-8 w-8 mr-4 text-gray-600" />
                    Panel de Administración
                </h1>
                <div className="flex items-center gap-2">
                    {activeTab !== 'overview' && (
                        <button
                            onClick={() => setActiveTab('overview')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded-full uppercase tracking-wider transition"
                        >
                            ← Volver a métricas
                        </button>
                    )}
                    <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-2 rounded-full uppercase tracking-wider">Modo Vista Global</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={() => setActiveTab(stat.id)}
                        className={`${stat.bg} ${stat.border} border p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition cursor-pointer transform hover:-translate-y-1`}
                    >
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

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ideas por Estado */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-3 text-orange-500" /> Distribución de Ideas
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats.ideas_by_status).map(([status, count]) => (
                                <div key={status} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                    <span className="font-semibold text-gray-700 capitalize text-sm">{status}</span>
                                    <span className="bg-orange-100 text-orange-800 font-bold px-3 py-1 rounded-full text-xs">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Proyectos Votados */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <Workflow className="h-5 w-5 mr-3 text-orange-500" /> Proyectos Destacados (Votos)
                        </h3>
                        {stats.top_projects?.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-10 bg-gray-50 rounded-xl border border-dashed">Sin proyectos aún</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.top_projects.map(proj => (
                                    <div key={proj.id} className="border border-gray-100 p-4 rounded-xl flex justify-between items-center hover:border-orange-200 transition bg-white shadow-sm hover:shadow">
                                        <div>
                                            <p className="font-bold text-gray-900 mb-1">{proj.name}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{proj.description}</p>
                                        </div>
                                        <div className="flex flex-col items-center bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                                            <span className="text-xl font-extrabold text-orange-600">{proj.votes}</span>
                                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">votos</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Listas Detalladas */}
            {activeTab === 'users' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Users className="h-6 w-6 mr-3 text-orange-500" /> Lista de Usuarios Registrados
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Nombre</th>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Correo</th>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.users?.map(u => (
                                    <tr key={u.id} className="border-b transition hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900">{u.name}</td>
                                        <td className="p-3 text-gray-600">{u.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'ideas' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Lightbulb className="h-6 w-6 mr-3 text-orange-500" /> Lista de Ideas
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Título</th>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Autor</th>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Estado</th>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.ideas?.map(i => (
                                    <tr key={i.id} className="border-b transition hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900 truncate max-w-xs">{i.title}</td>
                                        <td className="p-3 text-gray-600">{i.author}</td>
                                        <td className="p-3">
                                            <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase">
                                                {i.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => navigate(`/idea/${i.id}`)} className="text-orange-600 hover:text-orange-800 font-semibold text-xs uppercase hover:underline">Ver Detalle</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Workflow className="h-6 w-6 mr-3 text-orange-500" /> Lista de Proyectos Activos
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Proyecto</th>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Idea Asociada</th>
                                    <th className="p-3 text-gray-600 uppercase text-xs font-bold tracking-wider">Es Ganador</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.projects?.map(p => (
                                    <tr key={p.id} className="border-b transition hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                                        <td className="p-3 text-gray-600 truncate max-w-xs">{p.idea}</td>
                                        <td className="p-3">
                                            {p.is_winner ? (
                                                <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Sí</span>
                                            ) : (
                                                <span className="text-gray-400 font-semibold">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard