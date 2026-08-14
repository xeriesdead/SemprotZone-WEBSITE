---
name: Database bootstrap scripts
description: Safe naming for database initialization commands in pnpm workspaces
---

Deploy-only database setup must use an explicit command name rather than a pnpm lifecycle name such as `prepare`.

**Why:** pnpm can run lifecycle-named scripts during dependency installation, which can unexpectedly connect to a database and mutate its schema or seed data.

**How to apply:** Use a named command such as `ensure-schema` and invoke it explicitly from the deployment start or migration process.