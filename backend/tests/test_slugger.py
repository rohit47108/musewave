from app.services.slugger import build_pretty_slug, slugify


def test_slugify_handles_whitespace():
    assert slugify("Calm x Mystical Drift") == "calm-x-mystical-drift"


def test_build_pretty_slug_is_seeded():
    assert build_pretty_slug("Calm Drift", 7) == build_pretty_slug("Calm Drift", 7)
