# Stories — Scrum process for Bionicle Collective

This folder holds **user stories** for site improvements, organized in a lightweight scrum format.

## Folder structure

```
stories/
├── README.md           ← You are here (process overview)
├── STORY-TEMPLATE.md   ← Copy this when creating new stories
├── backlog/            ← Stories not yet in a sprint
├── sprint/             ← Current sprint (active work)
└── done/               ← Completed stories (archive)
```

## Process

### 1. Add a new story

- Copy `STORY-TEMPLATE.md` into `backlog/`
- Rename to something like `STORY-001-short-description.md`
- Fill in the template (user story, acceptance criteria, notes)

### 2. Sprint planning

- When starting work, move stories from `backlog/` to `sprint/`
- Keep the sprint small (e.g. 3–5 stories)
- Add a sprint goal or dates in `sprint/README.md` if helpful

### 3. Work on stories

- Pick a story from `sprint/`
- Update its status as you work (Todo → In Progress → In Review)
- Check off acceptance criteria when done

### 4. Complete a story

- Mark the story as Done
- Move it from `sprint/` to `done/`
- Optionally add completion notes or links to commits/PRs

## Definition of done

A story is done when:

- [ ] Acceptance criteria are met
- [ ] Code is tested (manual or automated)
- [ ] Changes are merged to main (or your primary branch)

## Keeping the ship afloat

This process helps you:

- **Track what’s next** — backlog keeps ideas from getting lost
- **Document decisions** — stories capture why things were built
- **Stay focused** — sprint limits work in progress
- **Celebrate progress** — `done/` is your record of completed work
