from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models
from ..database import get_db
from ..core.security import get_current_admin_user

router = APIRouter()

@router.get("/", dependencies=[Depends(get_current_admin_user)])
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_ideas = db.query(models.Idea).count()
    total_users = db.query(models.User).count()
    total_projects = db.query(models.Project).count()
    
    status_counts = db.query(
        models.Idea.status, 
        func.count(models.Idea.id)
    ).group_by(models.Idea.status).all()
    status_distribution = {status: count for status, count in status_counts}

    top_projects_query = db.query(
        models.Project, 
        func.count(models.Vote.id).label('vote_count')
    ).outerjoin(models.Vote, models.Vote.project_id == models.Project.id).group_by(models.Project.id).order_by(func.count(models.Vote.id).desc()).limit(5).all()
    
    top_projects = [{"id": str(p.id), "name": p.name, "description": p.description, "votes": vc} for p, vc in top_projects_query]

    return {
        "total_ideas": total_ideas,
        "ideas_by_status": status_distribution,
        "total_projects": total_projects,
        "total_users": total_users,
        "top_projects": top_projects
    }
