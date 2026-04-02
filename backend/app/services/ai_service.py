import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generar_ideas(categoria: str, descripcion: str):
    if not client.api_key:
        return ["Configura OPENAI_API_KEY en tu .env"]

    try:
        prompt = f"Genera 3 ideas de proyectos innovadores y viables relacionados con la categoría '{categoria}'. Contexto adicional: '{descripcion}'. Devuelve solo una lista enumerada con títulos cortos."
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un asistente experto en innovación para semilleros de investigación."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=250,
            temperature=0.7
        )
        ideas = response.choices[0].message.content.strip().split('\n')
        return [idea.strip() for idea in ideas if idea.strip()]
    except Exception as e:
        return [f"Error al conectar con la IA: {str(e)}"]

async def enriquecer_descripcion_idea(titulo: str, descripcion: str):
    if not client.api_key:
        return "Configura OPENAI_API_KEY en tu .env para enriquecer descripciones."

    try:
        prompt = f"Tengo la siguiente idea de investigación: Título: '{titulo}'. Descripción inicial: '{descripcion}'. Mejora la descripción haciéndola más profesional, detallando el problema que resuelve, y posibles tecnologías a usar."
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un experto en redactar y estructurar propuestas de investigación y proyectos de software."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error al generar descripción enriquecida: {str(e)}"
