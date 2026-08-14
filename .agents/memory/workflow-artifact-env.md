---
name: Artifact workflow environment
description: Managed artifact workflows may omit project-required PORT and BASE_PATH values and cannot be overridden through the generic workflow configurator.
---

Managed artifact workflows cannot be overridden through the generic workflow configuration callback. If an imported Vite/Express artifact requires PORT or BASE_PATH and the managed workflow does not provide them, verify builds with explicit environment values and treat preview startup as an environment/setup issue rather than a feature-code regression.

**Why:** The imported project’s managed workflows started without the required environment variables, while direct builds succeeded when those values were supplied.

**How to apply:** Check the artifact workflow logs first; avoid creating duplicate workflows or changing product code solely to work around a managed workflow unless the user explicitly requests Replit preview setup.