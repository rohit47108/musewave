import random
import re


ADJECTIVES = [
    "luminous",
    "tidal",
    "velvet",
    "solstice",
    "aurora",
    "silver",
    "echoing",
    "drifting"
]
NOUNS = [
    "lagoon",
    "horizon",
    "cathedral",
    "meadow",
    "constellation",
    "current",
    "bloom",
    "afterglow"
]


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:72] or "scene"


def build_pretty_slug(title: str, seed: int) -> str:
    randomizer = random.Random(seed)
    if title.strip():
        prefix = slugify(title)
    else:
        prefix = f"{randomizer.choice(ADJECTIVES)}-{randomizer.choice(NOUNS)}"

    suffix = "".join(randomizer.choice("abcdefghjkmnpqrstuvwxyz23456789") for _ in range(4))
    return f"{prefix}-{suffix}"
