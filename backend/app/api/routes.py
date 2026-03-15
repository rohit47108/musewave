from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.schemas.scene import ExportJob, ExportRequest, HealthResponse, ShareSceneRequest, ShareSceneResponse
from app.services.scene_service import enqueue_export, get_export_job, get_scene_by_slug, upsert_scene

router = APIRouter(prefix="/v1", tags=["musewave"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", version=settings.app_version)


@router.post("/scenes", response_model=ShareSceneResponse)
def create_or_update_scene(
    payload: ShareSceneRequest,
    database: Session = Depends(get_db)
) -> ShareSceneResponse:
    return upsert_scene(database, payload)


@router.get("/scenes/{slug}", response_model=ShareSceneResponse)
def read_scene(slug: str, database: Session = Depends(get_db)) -> ShareSceneResponse:
    scene = get_scene_by_slug(database, slug)
    if scene is None:
        raise HTTPException(status_code=404, detail="Scene not found.")
    return scene


@router.post("/scenes/{slug}/exports", response_model=ExportJob)
def create_scene_export(
    slug: str,
    payload: ExportRequest,
    database: Session = Depends(get_db)
) -> ExportJob:
    try:
        return enqueue_export(database, slug, payload)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/exports/{job_id}", response_model=ExportJob)
def read_export(job_id: str, database: Session = Depends(get_db)) -> ExportJob:
    job = get_export_job(database, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Export not found.")
    return job
