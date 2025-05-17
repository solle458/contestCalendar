"""create contests table

Revision ID: create_contests_table
Revises: 
Create Date: 2024-05-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'create_contests_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'contests',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('platform', sa.String(), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('duration_min', sa.Integer(), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('contests') 
