
# Features

## Prioritized Backlog

| # | Feature | Priority | Difficulty | Rationale |
|---|---------|----------|------------|-----------|
| 1 | **Delete elements via right-click** | 🔴 P1 – High | Low | Table-stakes editor interaction. Blocking for users who want to tweak output. Small effort, big usability win. |
| 2 | **Image placeholders + CDN replacement** | 🔴 P1 – High | Medium | Core UX gap. Generated sites without real images feel unfinished — directly impacts perceived quality and conversion to paid usage. |
| 3 | **Brand logo placement** | 🟡 P2 – Medium | Medium | Important for professional output, but depends on the image/asset story (#2) being solved first. |
| 4 | **Agent `answer` skill (prompt user mid-generation)** | 🟡 P2 – Medium | Medium-High | Improves generation quality by gathering clarifying info. High value but requires UX for mid-flow interruptions and agent-loop changes. |
| 5 | **Upload brand guidelines document** | 🟢 P3 – Low (nice-to-have) | High | Power-user feature. Requires document parsing, prompt engineering to extract design tokens, and storage. Low ROI until the core editor is solid. |

### Suggested execution order

1. Delete elements via right-click
2. Image placeholders + CDN replacement
3. Brand logo placement
4. Agent `answer` skill
5. Upload brand guidelines document
