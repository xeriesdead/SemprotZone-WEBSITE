---
name: Media URL contract
description: Durable verification rule for database-backed film and series playback.
---

When catalog data is stored in PostgreSQL, verify both media URL paths: movies use the content record's video URL, while series use the selected episode's video URL.

**Why:** A response can contain correct titles, genres, and episode records while playback still fails if the content-level movie URL is omitted or the client only checks episode data.

**How to apply:** For changes to catalog responses or playback, validate homepage/browse/detail data plus movie playback and series episode playback independently.