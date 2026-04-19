# Helm Deployment

Gasket can be deployed to Kubernetes using the Helm charts provided in the `helm` repository.

Source: [`helm`](https://github.com/Gasket-Gateway/helm) repository.


# Schema Management

Gasket uses [Alembic](https://alembic.sqlalchemy.org/) to manage PostgreSQL schema changes. Migrations are versioned Python files that live in the `migrations/versions/` directory and are tracked in version control alongside application code.

## How It Works

1. Each migration file defines an `upgrade()` and `downgrade()` function
2. Alembic tracks the current schema version in an `alembic_version` table in PostgreSQL
3. On application startup, Gasket automatically runs `alembic upgrade head` to apply any pending migrations
4. If the database is already up to date, no changes are made

This means **sysadmins do not need to run migrations manually** — deploying a new version of Gasket will automatically apply any required schema changes before serving traffic.

## Migration Flow

```
New Gasket version deployed
        │
        ▼
App startup calls `alembic upgrade head`
        │
        ├─ alembic_version table exists?
        │     ├─ Yes → check current revision
        │     └─ No  → create it, start from scratch
        │
        ├─ Pending migrations?
        │     ├─ Yes → apply in order
        │     └─ No  → skip, app starts normally
        │
        ▼
Application ready to serve traffic
```

## Checking Migration Status

To inspect the current schema version:

```bash
# Inside the container
alembic current

# Or query PostgreSQL directly
SELECT * FROM alembic_version;
```

To view the full migration history:

```bash
alembic history --verbose
```

## Downgrading

If a migration needs to be reversed (e.g. rolling back to a previous Gasket version):

```bash
# Roll back one migration
alembic downgrade -1

# Roll back to a specific revision
alembic downgrade <revision_id>

# Roll back all migrations
alembic downgrade base
```

!!! warning "Data loss"
    Downgrading may drop columns or tables, which will **permanently delete data** in those structures. Always back up the database before downgrading.

## Creating a New Migration

When developing a new feature that requires schema changes:

```bash
# Generate a new migration file
alembic revision -m "add_api_keys_table"
```

This creates a new file in `migrations/versions/`. Edit it to define the schema change using Alembic operations:

```python
def upgrade() -> None:
    op.create_table(
        "api_keys",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_email", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("key_value", sa.Text(), nullable=False),
        sa.Column("key_preview", sa.Text(), nullable=False),
        sa.Column("profile_id", sa.Integer(),
                  sa.ForeignKey("backend_profiles.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("key_value"),
    )

def downgrade() -> None:
    op.drop_table("api_keys")
```

## Development Rules

- **Every schema change must have a migration** — never modify the database schema manually
- **Every migration must have both `upgrade()` and `downgrade()`** — to support rollbacks
- **Migrations are append-only** — never edit a migration that has been applied to any environment
- **Test both directions** — run `upgrade` then `downgrade` to verify reversibility


