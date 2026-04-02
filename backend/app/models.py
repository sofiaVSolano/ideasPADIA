import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Enum as SQLEnum, Table, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.types import CHAR

def generate_uuid():
    return str(uuid.uuid4())

idea_tags = Table(
    'idea_tags',
    Base.metadata,
    Column('idea_id', CHAR(36), ForeignKey('ideas.id'), primary_key=True),
    Column('tag_id', CHAR(36), ForeignKey('tags.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # 'user' o 'admin'

    ideas = relationship("Idea", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    votes = relationship("Vote", back_populates="user")

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="idea") # 'idea', 'exploración', etc.
    author_id = Column(CHAR(36), ForeignKey("users.id"))
    
    author = relationship("User", back_populates="ideas")
    projects = relationship("Project", back_populates="idea")
    comments = relationship("Comment", back_populates="idea")
    votes = relationship("Vote", back_populates="idea")
    tags = relationship("Tag", secondary=idea_tags, back_populates="ideas")

class Project(Base):
    __tablename__ = "projects"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    repo_link = Column(String)
    is_winner = Column(Boolean, default=False)
    idea_id = Column(CHAR(36), ForeignKey("ideas.id"))

    idea = relationship("Idea", back_populates="projects")
    votes = relationship("Vote", back_populates="project")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(CHAR(36), ForeignKey("users.id"))
    idea_id = Column(CHAR(36), ForeignKey("ideas.id"))

    author = relationship("User", back_populates="comments")
    idea = relationship("Idea", back_populates="comments")

class Vote(Base):
    __tablename__ = "votes"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(CHAR(36), ForeignKey("users.id"))
    idea_id = Column(CHAR(36), ForeignKey("ideas.id"))
    project_id = Column(CHAR(36), ForeignKey("projects.id"))

    user = relationship("User", back_populates="votes")
    idea = relationship("Idea", back_populates="votes")
    project = relationship("Project", back_populates="votes")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(CHAR(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    ideas = relationship("Idea", secondary=idea_tags, back_populates="tags")