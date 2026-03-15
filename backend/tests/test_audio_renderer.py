from app.schemas.scene import MoodBlend
from app.services.audio_renderer import render_scene_to_wav
from app.services.mood_composer import build_scene_from_blend


def test_render_scene_to_wav_returns_wav_bytes():
    scene = build_scene_from_blend([MoodBlend(mood="focused", weight=1.0)], seed=13)
    payload = render_scene_to_wav(scene, 30)

    assert payload[:4] == b"RIFF"
