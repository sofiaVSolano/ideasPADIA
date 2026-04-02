import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ideaService, projectService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ThumbsUp, MapPin, Tag, User as UserIcon, Trash2, Plus, Trophy, ExternalLink, CheckCircle, Edit3 } from 'lucide-react';

const IdeaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [idea, setIdea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Idea Edit
    const [isEditingIdea, setIsEditingIdea] = useState(false);
    const [ideaEditForm, setIdeaEditForm] = useState({ title: '', description: '' });

    const [commentContent, setCommentContent] = useState('');
    const [commenting, setCommenting] = useState(false);
    const [voting, setVoting] = useState(false);
    const [statusUpdateLoader, setStatusUpdateLoader] = useState(false);

    const [showProjectForm, setShowProjectForm] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [submittingProject, setSubmittingProject] = useState(false);

    const [editingRepo, setEditingRepo] = useState(null);
    const [repoLink, setRepoLink] = useState('');

    const [editingProject, setEditingProject] = useState(null);
    const [projectEditForm, setProjectEditForm] = useState({ name: '', description: '' });

    const [assigningWinner, setAssigningWinner] = useState(null);
    const [winnerRepoLink, setWinnerRepoLink] = useState('');

    const fetchIdeaData = async () => {
        try {
            setLoading(true);
            const res = await ideaService.getIdeaById(id);
            setIdea(res.data);
            setIdeaEditForm({ title: res.data.title, description: res.data.description });
        } catch (err) {
            setError('Idea no encontrada o hubo un error.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIdeaData();
    }, [id]);

    const handleStatusChange = async (e) => {
        if (!user || user.role !== 'admin') return;
        setStatusUpdateLoader(true);
        try {
            await ideaService.updateStatus(idea.id, e.target.value);
            setIdea({ ...idea, status: e.target.value });
        } catch (err) {
            alert("Error actualizando el estado");
        } finally {
            setStatusUpdateLoader(false);
        }
    };

    const handleEditIdea = async () => {
        try {
            setStatusUpdateLoader(true);
            await ideaService.updateIdea(idea.id, ideaEditForm);
            setIsEditingIdea(false);
            await fetchIdeaData();
        } catch (e) {
            alert("Error editando la idea");
        } finally {
            setStatusUpdateLoader(false);
        }
    };

    const handleDeleteIdea = async () => {
        if (!window.confirm("¿¿Seguro que deseas eliminar TODA la Idea de forma permanente?")) return;
        try {
            setStatusUpdateLoader(true);
            await ideaService.deleteIdea(idea.id);
            navigate('/dashboard');
        } catch (e) {
            alert("Error eliminando la idea");
        } finally {
            setStatusUpdateLoader(false);
        }
    };

    const confirmAssignWinner = async (projectId) => {
        if (!user || user.role !== 'admin') return;
        setStatusUpdateLoader(true);
        try {
            // First mark as winner with optional repo link
            const updatePayload = { is_winner: true };
            if (winnerRepoLink.trim()) {
                updatePayload.repo_link = winnerRepoLink.trim();
            }
            await projectService.actualizarProyecto(idea.id, projectId, updatePayload);

            // Then update the idea status
            await ideaService.updateStatus(idea.id, 'en proyecto');

            // Close form and refresh
            setAssigningWinner(null);
            setWinnerRepoLink('');
            await fetchIdeaData();
        } catch (e) {
            alert("Error asignando");
        } finally {
            setStatusUpdateLoader(false);
        }
    }

    const confirmUnassignWinner = async (projectId) => {
        if (!user || user.role !== 'admin') return;
        if (!window.confirm("¿Desasignar ganador de esta idea?")) return;
        setStatusUpdateLoader(true);
        try {
            await projectService.actualizarProyecto(idea.id, projectId, { is_winner: false, repo_link: null });
            await ideaService.updateStatus(idea.id, 'idea');
            await fetchIdeaData();
        } catch (e) {
            alert("Error desasignando ganador");
        } finally {
            setStatusUpdateLoader(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("¿¿Seguro de eliminar este proyecto del usuario?")) return;
        try {
            await projectService.eliminarProyecto(idea.id, projectId);
            await fetchIdeaData();
        } catch (e) {
            alert("Error al eliminar el proyecto");
        }
    };

    const handleEditProject = async (projectId) => {
        if (!projectEditForm.name.trim() || !projectEditForm.description.trim()) return;
        try {
            await projectService.actualizarProyecto(idea.id, projectId, projectEditForm);
            setEditingProject(null);
            setProjectEditForm({ name: '', description: '' });
            await fetchIdeaData();
        } catch (e) {
            alert("Error actualizando proyecto");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        setCommenting(true);
        try {
            await ideaService.comentarIdea(idea.id, commentContent);
            setCommentContent('');
            await fetchIdeaData();
        } catch (err) {
            alert("Error publicando comentario");
        } finally {
            setCommenting(false);
        }
    };

    const handleProposeProject = async (e) => {
        e.preventDefault();
        if (!newProject.name.trim()) return;
        setSubmittingProject(true);
        try {
            await projectService.crearProyecto(idea.id, newProject);
            setNewProject({ name: '', description: '' });
            setShowProjectForm(false);
            await fetchIdeaData();
        } catch (err) {
            alert("Error proponiendo proyecto");
        } finally {
            setSubmittingProject(false);
        }
    }

    const handleUpdateRepo = async (projectId) => {
        if (!repoLink.trim()) return;
        try {
            await projectService.actualizarProyecto(idea.id, projectId, { repo_link: repoLink });
            setEditingRepo(null);
            setRepoLink('');
            await fetchIdeaData();
        } catch (e) {
            alert("Error guardando el link");
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("¿Seguro de eliminar este comentario?")) return;
        try {
            await ideaService.deleteComment(commentId);
            await fetchIdeaData();
        } catch (err) {
            alert("Error borrando el comentario");
        }
    };

    const handleVote = async (projectId) => {
        setVoting(true);
        try {
            await projectService.votarProyecto(idea.id, projectId);
            await fetchIdeaData();
        } catch (err) {
            alert(err.response?.data?.detail || "Error al votar");
        } finally {
            setVoting(false);
        }
    };

    if (loading) return <div className="text-center py-20 animate-pulse text-gray-500 font-medium">Cargando detalles de la idea...</div>;
    if (error || !idea) return <div className="text-center py-20 text-red-500 font-semibold">{error}</div>;

    const canEditOrDelete = user?.role === 'admin' || user?.id === idea.author_id;

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 relative">
                    {canEditOrDelete && !isEditingIdea && (
                        <div className="absolute top-6 right-6 flex gap-2">
                            <button onClick={() => setIsEditingIdea(true)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Editar"><Edit3 className="h-5 w-5" /></button>
                            <button onClick={handleDeleteIdea} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Eliminar"><Trash2 className="h-5 w-5" /></button>
                        </div>
                    )}

                    {isEditingIdea ? (
                        <div className="space-y-4 mb-6">
                            <input value={ideaEditForm.title} onChange={e => setIdeaEditForm({ ...ideaEditForm, title: e.target.value })} className="w-full text-2xl font-bold border-b border-gray-300 focus:border-blue-500 outline-none pb-2" />
                            <textarea value={ideaEditForm.description} onChange={e => setIdeaEditForm({ ...ideaEditForm, description: e.target.value })} className="w-full h-32 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            <div className="flex gap-2">
                                <button onClick={handleEditIdea} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">Guardar Cambios</button>
                                <button onClick={() => setIsEditingIdea(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm">Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <h1 className="text-3xl font-extrabold text-gray-900 pr-16">{idea.title}</h1>
                            </div>

                            <div className="prose max-w-none text-gray-700 leading-relaxed mb-8 whitespace-pre-wrap">
                                {idea.description}
                            </div>
                        </>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                        <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-2" />
                            Propuesto por: <strong className="text-gray-800 ml-1">{idea.author?.name || idea.author_id.slice(0, 6)}</strong>
                        </div>
                        {idea.tags?.map(t => (
                            <span key={t.id} className="flex items-center text-xs font-bold text-gray-600 bg-gray-200 px-2.5 py-1 rounded">
                                <Tag className="h-3 w-3 mr-1" /> {t.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <MapPin className="h-5 w-5 mr-3 text-purple-600" />
                            Proyectos Propuestos
                        </h3>
                        {idea.status !== 'en proyecto' && idea.status !== 'desarrollada' && idea.status !== 'descartada' && (
                            <button
                                onClick={() => setShowProjectForm(!showProjectForm)}
                                className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold px-3 py-1.5 rounded-lg text-sm transition flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Proponer Proyecto
                            </button>
                        )}
                    </div>

                    {showProjectForm && idea.status !== 'en proyecto' && (
                        <form onSubmit={handleProposeProject} className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6 space-y-3">
                            <input
                                required placeholder="Nombre del Proyecto"
                                value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                className="w-full p-2 text-sm rounded border border-purple-200 outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <textarea
                                required placeholder="Descripción de cómo lo implementarás" rows={2}
                                value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                className="w-full p-2 text-sm rounded border border-purple-200 outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowProjectForm(false)} className="text-sm px-3 py-1 text-gray-500 font-semibold hover:bg-gray-200 rounded">Cancelar</button>
                                <button type="submit" disabled={submittingProject} className="bg-purple-600 text-white text-sm px-4 py-1.5 rounded font-bold hover:bg-purple-700 disabled:opacity-50">Proponer</button>
                            </div>
                        </form>
                    )}

                    {idea.projects?.length === 0 ? (
                        <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-4 rounded-lg text-center border border-gray-100 border-dashed">
                            Aún no hay proyectos iniciados/propuestos basados en esta idea.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {idea.projects?.map(proj => {
                                const hasVoted = proj.votes?.some(v => v.user_id === user?.id);

                                return (
                                    <div key={proj.id} className={`border p-5 rounded-xl transition ${proj.is_winner ? 'border-yellow-300 bg-yellow-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-bold text-blue-700">{proj.name}</h4>
                                                {proj.is_winner && (
                                                    <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold flex items-center shadow-sm">
                                                        <Trophy className="h-3 w-3 mr-1" /> Ganador
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center">
                                                    {proj.votes?.length || 0} votos
                                                </span>
                                                {(user?.role === 'admin' || user?.id === proj.user_id) && !editingProject && (
                                                    <>
                                                        <button onClick={() => { setEditingProject(proj.id); setProjectEditForm({ name: proj.name, description: proj.description }); }} className="bg-gray-200 hover:bg-blue-100 text-gray-700 hover:text-blue-800 p-1.5 rounded-lg transition" title="Editar">
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteProject(proj.id)} className="bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-800 p-1.5 rounded-lg transition" title="Eliminar">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {user?.role === 'admin' && idea.status !== 'en proyecto' && idea.status !== 'desarrollada' && !proj.is_winner && (
                                                    <button
                                                        onClick={() => setAssigningWinner(proj.id)}
                                                        className="bg-yellow-100 hover:bg-yellow-200 flex items-center px-3 py-1.5 rounded-lg text-sm text-yellow-800 font-semibold transition cursor-pointer"
                                                    >
                                                        <Trophy className="h-4 w-4 mr-1" /> Elegir Ganador
                                                    </button>
                                                )}
                                                {user?.role === 'admin' && proj.is_winner && (
                                                    <button
                                                        onClick={() => confirmUnassignWinner(proj.id)}
                                                        disabled={statusUpdateLoader}
                                                        className="bg-red-100 hover:bg-red-200 text-red-800 flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer"
                                                    >
                                                        Desasignar Ganador
                                                    </button>
                                                )}
                                                {idea.status !== 'en proyecto' && idea.status !== 'desarrollada' && (
                                                    <button
                                                        onClick={() => handleVote(proj.id)}
                                                        disabled={voting}
                                                        className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition ${hasVoted ? 'bg-green-600 text-white hover:bg-red-600 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-800'}`}
                                                    >
                                                        <ThumbsUp className="h-4 w-4 mr-1" /> {hasVoted ? 'Quitar Voto' : 'Votar'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {editingProject === proj.id ? (
                                            <div className="space-y-3 mb-4">
                                                <input value={projectEditForm.name} onChange={e => setProjectEditForm({ ...projectEditForm, name: e.target.value })} className="w-full text-lg font-bold border-b border-gray-300 focus:border-blue-500 outline-none pb-1" />
                                                <textarea value={projectEditForm.description} onChange={e => setProjectEditForm({ ...projectEditForm, description: e.target.value })} className="w-full h-24 border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditProject(proj.id)} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold text-xs text-sm">Guardar</button>
                                                    <button onClick={() => setEditingProject(null)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold text-xs text-sm">Cancelar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-600 text-sm mb-4">{proj.description}</p>
                                        )}

                                        {/* Componente para asignar ganador */}
                                        {assigningWinner === proj.id && (
                                            <div className="bg-white p-4 rounded-lg my-4 border border-yellow-200 shadow-sm animate-fade-in">
                                                <h5 className="font-bold text-gray-900 mb-2 text-sm flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                                    ¿Confirmar cómo proyecto ganador?
                                                </h5>
                                                <p className="text-xs text-gray-500 mb-3">La idea pasará a estado "En proyecto". Puedes adjuntar el repositorio ahora o después.</p>
                                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                                    <input
                                                        type="url"
                                                        placeholder="Link del repositorio (Opcional)"
                                                        value={winnerRepoLink}
                                                        onChange={(e) => setWinnerRepoLink(e.target.value)}
                                                        className="flex-1 p-2 text-sm border rounded outline-none focus:border-yellow-500"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => confirmAssignWinner(proj.id)} disabled={statusUpdateLoader} className="bg-yellow-500 text-yellow-900 text-sm px-4 py-2 rounded font-bold hover:bg-yellow-400">¿Confirmar</button>
                                                        <button onClick={() => { setAssigningWinner(null); setWinnerRepoLink(''); }} className="bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded font-semibold hover:bg-gray-300">Cancelar</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mostrar Repositorio solo al ganador y en fase desarrollada */}
                                        {proj.is_winner && idea.status === 'desarrollada' && (
                                            <div className="mt-4 pt-4 border-t border-yellow-200">
                                                {proj.repo_link ? (
                                                    <a href={proj.repo_link} target="_blank" rel="noreferrer" className="inline-flex items-center text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition">
                                                        <ExternalLink className="h-4 w-4 mr-2" /> Ver Repositorio en GitHub
                                                    </a>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {editingRepo === proj.id ? (
                                                            <div className="flex gap-2 w-full">
                                                                <input
                                                                    type="url"
                                                                    placeholder="https://github.com/..."
                                                                    value={repoLink}
                                                                    onChange={(e) => setRepoLink(e.target.value)}
                                                                    className="flex-1 p-2 text-sm border rounded outline-none focus:border-yellow-500"
                                                                />
                                                                <button onClick={() => handleUpdateRepo(proj.id)} className="bg-yellow-500 text-yellow-900 text-sm px-3 py-1 rounded font-bold hover:bg-yellow-400">Guardar</button>
                                                                <button onClick={() => { setEditingRepo(null); setRepoLink(''); }} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded font-semibold hover:bg-gray-300">Cancelar</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setEditingRepo(proj.id)} className="text-yellow-700 hover:underline text-sm font-bold flex items-center">
                                                                <Plus className="h-4 w-4 mr-1" /> Añadir Repositorio
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {user?.role === 'admin' && (
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                        <h3 className="font-bold text-orange-900 mb-3 uppercase text-xs tracking-wider">Controles de Admin</h3>
                        <label className="text-sm font-medium text-orange-800 block mb-2">Actualizar Estado de Idea</label>
                        <select
                            value={idea.status}
                            onChange={handleStatusChange}
                            disabled={statusUpdateLoader}
                            className="w-full border-orange-300 rounded-lg p-2 text-sm bg-white"
                        >
                            <option value="idea">Idea</option>
                            <option value="exploración">Exploración</option>
                            <option value="validada">Validada</option>
                            <option value="en proyecto">En proyecto</option>                            <option value="desarrollada">Desarrollada</option>                            <option value="descartada">Descartada</option>
                        </select>
                    </div>
                )}

                {user?.role !== 'admin' && (
                    <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Fase Actual</span>
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase">{idea.status}</span>
                    </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-4">
                        <MessageSquare className="h-5 w-5 mr-3 text-blue-600" />
                        Discusión ({idea.comments?.length || 0})
                    </h3>

                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                        {idea.comments?.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">Inicia la conversación.</p>
                        ) : (
                            idea.comments?.map(c => (
                                <div key={c.id} className="border-l-2 border-blue-400 pl-4 py-1 relative group">
                                    <p className="text-xs font-semibold text-gray-900 mb-1 flex justify-between">
                                        <span>{c.author?.name || c.user_id?.slice(0, 5)}</span>
                                        {(user?.role === 'admin' || user?.id === c.user_id) && (
                                            <button onClick={() => handleDeleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded transition">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{c.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="relative">
                        <textarea
                            rows={2}
                            required
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none pr-24 resize-none"
                            placeholder="Aporta un comentario..."
                        />
                        <button
                            type="submit"
                            disabled={commenting}
                            className="absolute right-2 bottom-2 bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {commenting ? '...' : 'Enviar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IdeaDetail;
