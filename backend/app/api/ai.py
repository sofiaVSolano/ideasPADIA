from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List

from ..services.ai_service import generar_ideas, enriquecer_descripcion_idea
from ..core.security import get_current_user
from .. import models

router = APIRouter()

class GenerarIdeasRequest(BaseModel):
    categoria: str
    descripcion: str

class EnriquecerIdeaRequest(BaseModel):
    titulo: str
    descripcion: str

@router.post("/generar", response_model=List[str])
async def endpoint_generar_ideas(req: GenerarIdeasRequest, current_user: models.User = Depends(get_current_user)):
    """
    Genera 3 ideas posibles basadas en una categoría y descripción
    """
    ideas = await generar_ideas(req.categoria, req.descripcion)
    return ideas

@router.post("/enriquecer", response_model=str)
async def endpoint_enriquecer_idea(req: EnriquecerIdeaRequest, current_user: models.User = Depends(get_current_user)):
    """
    Enriquece la descripción de una idea usando la IA de OpenAI
    """
    nueva_descripcion = await enriquecer_descripcion_idea(req.titulo, req.descripcion)
    return nueva_descripcion