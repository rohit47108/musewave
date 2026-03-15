from app.schemas.scene import MoodBlend
from app.services.mood_composer import build_scene_from_blend, canonicalize_scene, normalize_blend


def test_normalize_blend_prefers_highest_weights():
    blend = normalize_blend(
        [
            MoodBlend(mood="calm", weight=0.1),
            MoodBlend(mood="joyful", weight=0.4),
            MoodBlend(mood="mystical", weight=0.3),
            MoodBlend(mood="focused", weight=0.2),
        ]
    )

    assert len(blend) == 3
    assert blend[0].mood == "joyful"
    assert round(sum(entry.weight for entry in blend), 4) == 1


def test_canonicalize_scene_clamps_values():
    scene = build_scene_from_blend([MoodBlend(mood="calm", weight=1.0)], seed=7)
    scene.controls.intensity = 3
    scene.layers[0].gain = -1

    canonical = canonicalize_scene(scene)

    assert 0 <= canonical.controls.intensity <= 1
    assert 0 <= canonical.layers[0].gain <= 1
