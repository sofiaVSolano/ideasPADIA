import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Lightbulb, Plus, Clock, User as UserIcon, Tag as TagIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const statusColors = {
        'idea': 'bg-gray-100 text-gray-800 border-gray-200',
        'exploración': 'bg-orange-100 text-orange-800 border-orange-300',
        'validada': 'bg-orange-100 text-orange-800 border-orange-300',
        'en proyecto': 'bg-gray-100 text-gray-800 border-gray-300',
        'desarrollada': 'bg-orange-100 text-orange-800 border-orange-300',
        'descartada': 'bg-orange-100 text-orange-800 border-orange-300'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[status] || statusColors['idea']} shadow-sm`}>
            {status.toUpperCase()}
        </span>
    );
};

const IdeaCard = ({ idea }) => {
    // Definimos colores de borde y fondo muy leves según el estado para la tarjeta
    const cardColors = {
        'idea': 'border-gray-200 bg-white hover:border-gray-300',
        'exploración': 'border-orange-200 bg-orange-50 hover:border-orange-300',
        'validada': 'border-orange-200 bg-orange-50 hover:border-orange-300',
        'en proyecto': 'border-gray-200 bg-gray-50 hover:border-gray-300',
        'desarrollada': 'border-orange-200 bg-orange-50 hover:border-orange-300',
        'descartada': 'border-orange-200 bg-orange-50 hover:border-orange-300'
    };

    const cardClass = cardColors[idea.status] || cardColors['idea'];

    return (
        <Link to={`/ideas/${idea.id}`} className={`block rounded-xl shadow-sm border transition-all duration-200 overflow-hidden group ${cardClass}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                        {idea.title}
                    </h3>
                    <StatusBadge status={idea.status} />
                </div>

                <p className="text-gray-700 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {idea.description}
                </p>

                {idea.tags && idea.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        {idea.tags.map(tag => (
                            <span key={tag.id} className="bg-white/60 border border-black/5 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">#{tag.name}</span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                    <div className="flex items-center text-xs text-gray-600 font-medium">
                        <UserIcon className="h-4 w-4 mr-1 opacity-60" />
                        <span>ID Autor: {idea.author_id.slice(0, 8)}...</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const Home = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('Todas');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchIdeas = async () => {
            try {
                const response = await api.get('/api/ideas/');
                setIdeas(response.data);
            } catch (err) {
                setError('Error al cargar las ideas');
            } finally {
                setLoading(false);
            }
        };
        fetchIdeas();
    }, []);

    const filteredIdeas = ideas.filter(idea => {
        const matchesFilter = filter === 'Todas' || idea.status.toLowerCase() === filter.toLowerCase();
        const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) || idea.description.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Repositorio de Ideas</h1>
                    <p className="text-gray-500 mt-1 text-sm">Explora, discute y apoya las iniciativas del semillero.</p>
                </div>

                <Link
                    to="/ideas/crear"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg shadow-sm hover:bg-orange-700 transition ease-in-out duration-150 gap-2 shrink-0 md:w-auto w-full justify-center"
                >
                    <Plus className="h-5 w-5" />
                    Nueva Idea
                </Link>
            </div>

            {error && <div className="p-4 mb-6 text-sm text-orange-800 rounded-lg border border-orange-200 bg-orange-50" role="alert">{error}</div>}

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Buscar por título o contenido..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-2/3 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-1/3 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white font-medium text-gray-700"
                >
                    <option value="Todas">Todos los estados</option>
                    <option value="Idea">Idea</option>
                    <option value="Exploración">Exploración</option>
                    <option value="Validada">Validada</option>
                    <option value="En proyecto">En Proyecto</option>
                    <option value="Descartada">Descartada</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : filteredIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIdeas.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <Lightbulb className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No se encontraron ideas</h3>
                    <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">No hay ideas que coincidan con tu búsqueda o filtro actual. ¡Sé el primero en proponer algo increíble!</p>
                </div>
            )}
        </div>
    );
};

export default Home;