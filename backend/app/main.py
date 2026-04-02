from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .api import auth, ideas, ai, dashboard

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Semillero Ideas PADIA - Backend Python")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(ideas.router, prefix="/api/ideas", tags=["Ideas, Proyectos, Comentarios y Votos"])
app.include_router(ai.router, prefix="/api/ai", tags=["Módulo de Inteligencia Artificial (IA)"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard para Administradores"], dependencies=[])

@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido a la API construida con FastAPI para el Semillero"}