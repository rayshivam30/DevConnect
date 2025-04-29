# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, Session, create_engine, select
from typing import Optional, List

app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database model
class Blog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str

# DB setup
sqlite_file_name = "blog.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, echo=True)

def create_db():
    SQLModel.metadata.create_all(engine)

@app.on_event("startup")
def on_startup():
    create_db()

# Routes
@app.get("/posts", response_model=List[Blog])
def get_posts():
    with Session(engine) as session:
        statement = select(Blog)
        result = session.exec(statement)
        return result.all()

@app.post("/posts", response_model=Blog)
def create_post(post: Blog):
    with Session(engine) as session:
        session.add(post)
        session.commit()
        session.refresh(post)
        return post

@app.get("/posts/{post_id}", response_model=Blog)
def get_post(post_id: int):
    with Session(engine) as session:
        post = session.get(Blog, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return post

@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    with Session(engine) as session:
        post = session.get(Blog, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        session.delete(post)
        session.commit()
        return {"message": "Post deleted"}

@app.put("/posts/{post_id}", response_model=Blog)
def update_post(post_id: int, updated_post: Blog):
    with Session(engine) as session:
        post = session.get(Blog, post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        post.title = updated_post.title
        post.content = updated_post.content
        session.commit()
        session.refresh(post)
        return post