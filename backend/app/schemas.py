from typing import List, Optional
from pydantic import BaseModel, EmailStr

# ---- USERS ----
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

# ---- TOKEN ----
class Token(BaseModel):
    access_token: str
    token_type: str

# ---- TAGS ----
class TagBase(BaseModel):
    name: str

class TagResponse(TagBase):
    id: str

    class Config:
        from_attributes = True

# ---- PROJECTS ----
class VoteResponse(BaseModel):
    id: str
    user_id: str
    project_id: str

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    repo_link: Optional[str] = None
    is_winner: bool = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    repo_link: Optional[str] = None
    is_winner: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: str
    idea_id: str
    votes: List[VoteResponse] = []

    class Config:
        from_attributes = True

# ---- COMMENTS ----
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: str
    user_id: str
    idea_id: str
    author: UserResponse
    
    class Config:
        from_attributes = True

# ---- IDEAS ----
class IdeaBase(BaseModel):
    title: str
    description: str

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class IdeaStatusUpdate(BaseModel):
    status: str

class IdeaResponse(IdeaBase):
    id: str
    status: str
    author_id: str
    author: UserResponse
    tags: List[TagResponse] = []
    projects: List[ProjectResponse] = []
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True

# ---- VOTES ----
class VoteResponse(BaseModel):
    id: str
    user_id: str
    idea_id: str
    project_id: str

    class Config:
        from_attributes = True