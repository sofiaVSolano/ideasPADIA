import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ideaService, aiService } from '../api/services';
import { Lightbulb, Wand2, ArrowRight } from 'lucide-react';

const CreateIdea = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [aiCategory, setAiCategory] = useState('');
    const [aiContext, setAiContext] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [enrichLoading, setEnrichLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleGenerate = async () => {
        if (!aiCategory) {
            alert("Por favor, ingresa una categoría para la IA.");
            return;
        }
        setAiLoading(true);
        try {
            const res = await aiService.generarIdeas(aiCategory, aiContext);
            setGeneratedIdeas(res.data);
        } catch (err) {
            alert("Hubo un problema comunicando con la IA.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleEnrich = async () => {
        if (!title || !description) {
            alert("Necesitas un título y una descripción mínima para enriquecer.");
            return;
        }
        setEnrichLoading(true);
        try {
            const res = await aiService.enriquecerIdea(title, description);
            setDescription(res.data);
        } catch (err) {
            alert("Fallo al enriquecer con la IA.");
        } finally {
            setEnrichLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await ideaService.createIdea({ title, description });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error creando la idea');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <Wand2 className="h-6 w-6 text-gray-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Generador de Ideas (Asistido por IA)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría / Temática</label>
                        <input
                            type="text"
                            value={aiCategory}
                            onChange={(e) => setAiCategory(e.target.value)}
                            placeholder="Ej. Salud, Educación, Finanzas..."
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contexto adicional (opcional)</label>
                        <input
                            type="text"
                            value={aiContext}
                            onChange={(e) => setAiContext(e.target.value)}
                            placeholder="Busco soluciones móviles o usando IoT..."
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                        />
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={aiLoading}
                    className="mt-4 bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                >
                    {aiLoading ? 'Generando...' : '💡 Obtener inspiraciones'}
                </button>

                {generatedIdeas.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Ideas Sugeridas:</h4>
                        <ul className="space-y-2">
                            {generatedIdeas.map((gi, idx) => (
                                <li key={idx} className="flex justify-between items-center text-sm text-gray-600 bg-white p-2 rounded shadow-sm">
                                    <span>{gi}</span>
                                    <button
                                        onClick={() => { setTitle(gi.replace(/^\d+\.\s*/, "")); setGeneratedIdeas([]); }}
                                        className="text-xs text-orange-600 font-medium hover:underline bg-orange-50 px-2 py-1 rounded"
                                    >
                                        Usar título
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Lightbulb className="text-orange-500 h-6 w-6" />
                    Registrar Nueva Idea
                </h2>

                {error && <div className="mb-4 bg-orange-50 text-orange-700 p-3 rounded-lg text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Idea *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Describe tu idea en un título corto"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                            Descripción y Justificación *
                            <button
                                type="button"
                                onClick={handleEnrich}
                                disabled={enrichLoading}
                                className="text-xs font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            >
                                ✨ {enrichLoading ? 'Escribiendo por ti...' : 'Mejorar texto con IA'}
                            </button>
                        </label>
                        <textarea
                            required
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                            placeholder="Explica el problema que resuelves, las tecnologías y su utilidad."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 px-6 py-3 rounded-lg hover:bg-orange-700 transition duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Publicar Idea'}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIdea;