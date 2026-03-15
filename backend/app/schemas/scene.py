from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


MoodId = Literal[
    "calm",
    "relaxed",
    "energetic",
    "reflective",
    "mystical",
    "joyful",
    "melancholic",
    "focused"
]
LayerRole = Literal["pad", "pulse", "texture", "sparkle"]
ExportDuration = Literal[30, 60, 120]


class MoodBlend(BaseModel):
    mood: MoodId
    weight: float = Field(ge=0, le=1)


class SceneControls(BaseModel):
    intensity: float = Field(ge=0, le=1)
    filter_cutoff: float = Field(alias="filterCutoff", ge=0, le=1)
    reverb: float = Field(ge=0, le=1)
    stereo_spread: float = Field(alias="stereoSpread", ge=0, le=1)
    visual_energy: float = Field(alias="visualEnergy", ge=0, le=1)
    master_volume: float = Field(alias="masterVolume", ge=0, le=1)
    tempo_jitter: float = Field(alias="tempoJitter", ge=0, le=1)

    model_config = {"populate_by_name": True}


class AudioLayerConfig(BaseModel):
    id: str
    label: str
    role: LayerRole
    enabled: bool
    gain: float = Field(ge=0, le=1)
    pan: float = Field(ge=-1, le=1)
    density: float = Field(ge=0, le=1)
    color: str


class VisualProfile(BaseModel):
    palette: list[str]
    gradient: list[str]
    particle_density: float = Field(alias="particleDensity", ge=0, le=1)
    fluidity: float = Field(ge=0, le=1)
    bloom: float = Field(ge=0, le=1)
    noise_scale: float = Field(alias="noiseScale", ge=0, le=1)
    motion_bias: float = Field(alias="motionBias", ge=0, le=1)

    model_config = {"populate_by_name": True}


class SceneSpec(BaseModel):
    version: str
    slug: str | None = None
    title: str
    description: str
    mood_blend: list[MoodBlend] = Field(alias="moodBlend", min_length=1, max_length=3)
    controls: SceneControls
    layers: list[AudioLayerConfig]
    visual_profile: VisualProfile = Field(alias="visualProfile")
    tempo: int
    key: str
    scale: str
    seed: int
    duration_hint: int = Field(alias="durationHint")
    created_at: str | None = Field(default=None, alias="createdAt")
    updated_at: str | None = Field(default=None, alias="updatedAt")

    model_config = {"populate_by_name": True}


class ShareSceneRequest(BaseModel):
    slug: str | None = None
    scene: SceneSpec
    author_name: str | None = Field(default=None, alias="authorName")
    cover_theme: str | None = Field(default=None, alias="coverTheme")

    model_config = {"populate_by_name": True}


class ShareSceneResponse(BaseModel):
    slug: str
    share_url: str = Field(alias="shareUrl")
    embed_url: str = Field(alias="embedUrl")
    og_image_url: str = Field(alias="ogImageUrl")
    scene: SceneSpec
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True}


class ExportRequest(BaseModel):
    duration_seconds: ExportDuration = Field(alias="durationSeconds")
    scene: SceneSpec | None = None

    model_config = {"populate_by_name": True}


class ExportJob(BaseModel):
    id: str
    slug: str
    duration_seconds: ExportDuration = Field(alias="durationSeconds")
    status: str
    audio_url: str | None = Field(default=None, alias="audioUrl")
    scene_url: str | None = Field(default=None, alias="sceneUrl")
    error_message: str | None = Field(default=None, alias="errorMessage")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True}


class HealthResponse(BaseModel):
    status: str
    version: str
