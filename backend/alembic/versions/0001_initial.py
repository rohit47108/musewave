"""Initial MuseWave schema."""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "scenes",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=1200), nullable=False),
        sa.Column("scene_json", sa.JSON(), nullable=False),
        sa.Column("visual_profile", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_scenes_slug", "scenes", ["slug"], unique=True)

    op.create_table(
        "export_jobs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("scene_slug", sa.String(length=120), sa.ForeignKey("scenes.slug"), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("audio_url", sa.String(length=1024), nullable=True),
        sa.Column("scene_url", sa.String(length=1024), nullable=True),
        sa.Column("storage_key", sa.String(length=1024), nullable=True),
        sa.Column("error_message", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_export_jobs_scene_slug", "export_jobs", ["scene_slug"], unique=False)
    op.create_index("ix_export_jobs_status", "export_jobs", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_export_jobs_status", table_name="export_jobs")
    op.drop_index("ix_export_jobs_scene_slug", table_name="export_jobs")
    op.drop_table("export_jobs")
    op.drop_index("ix_scenes_slug", table_name="scenes")
    op.drop_table("scenes")
