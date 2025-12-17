from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="LitRPG System Message Studio v2")

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
def index():
    return FileResponse(str(STATIC_DIR / "index.html"))

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
