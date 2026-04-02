from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..database import get_db
from ..core.security import get_current_user, get_current_admin_user

router = APIRouter()

# ---- IDEAS ----

@router.get("/", response_model=List[schemas.IdeaResponse])
def get_ideas(db: Session = Depends(get_db)):
    # Devolveremos ideas con tags y proyectos
    ideas = db.query(models.Idea).all()
    return ideas

@router.post("/", response_model=schemas.IdeaResponse, status_code=status.HTTP_201_CREATED)
def create_idea(idea: schemas.IdeaCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_idea = models.Idea(
        title=idea.title,
        description=idea.description,
        author_id=current_user.id
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea

@router.put("/{idea_id}/status", response_model=schemas.IdeaResponse)
def update_idea_status(idea_id: str, status_update: schemas.IdeaStatusUpdate, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea no encontrada")
    
    valid_statuses = ['idea', 'exploración', 'validada', 'en proyecto', 'descartada']
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Debe ser: {', '.join(valid_statuses)}")

    idea.status = status_update.status
    db.commit()
    db.refresh(idea)
    return idea

# ---- PROYECTOS ----

@router.post("/{idea_id}/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project_for_idea(idea_id: str, project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea no encontrada")
    
    db_project = models.Project(
        name=project.name,
        description=project.description,
        repo_link=project.repo_link,
        idea_id=idea_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.patch("/{idea_id}/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(idea_id: str, project_id: str, project_update: schemas.ProjectUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.idea_id == idea_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
        
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{idea_id}/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(idea_id: str, project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.idea_id == idea_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    if current_user.role != "admin" and project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este proyecto")
        
    db.delete(project)
    db.commit()
    return None

# ---- COMENTARIOS ----

@router.post("/{idea_id}/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(idea_id: str, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea no encontrada")
    
    db_comment = models.Comment(
        content=comment.content,
        user_id=current_user.id,
        idea_id=idea_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
        
    if current_user.role != "admin" and comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este comentario")
    
    db.delete(comment)
    db.commit()
    return None

# ---- VOTOS ----

@router.post("/{idea_id}/projects/{project_id}/vote", response_model=schemas.VoteResponse, status_code=status.HTTP_201_CREATED)
def vote_for_project(idea_id: str, project_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.idea_id == idea_id).first()
    
    if not idea or not project:
        raise HTTPException(status_code=404, detail="Idea o proyecto no encontrado en esta asociación")

    # Verificar que el usuario no haya votado ya por ALGUN proyecto en esta IDEA
    existing_vote = db.query(models.Vote).filter(models.Vote.user_id == current_user.id, models.Vote.idea_id == idea_id).first()
    if existing_vote:
        if existing_vote.project_id == project_id:
            db.delete(existing_vote)
            db.commit()
            return existing_vote
        else:
            existing_vote.project_id = project_id
            db.commit()
            db.refresh(existing_vote)
            return existing_vote

    db_vote = models.Vote(
        user_id=current_user.id,
        idea_id=idea_id,
        project_id=project_id
    )
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)
    return db_vote

@router.put("/{idea_id}", response_model=schemas.IdeaResponse)
def update_idea(idea_id: str, idea_update: schemas.IdeaUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea no encontrada")
    if idea.author_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta idea")
    
    update_data = idea_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(idea, key, value)
    db.commit()
    db.refresh(idea)
    return idea

@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(idea_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea no encontrada")
    if idea.author_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta idea")
    
    db.delete(idea)
    db.commit()
    return None
