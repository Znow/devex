---
name: branch-status-overview
description: Builds a team-presentable overview (Cursor canvas) of which improvements, PRs and branches are merged into a repo's main branches (e.g. release, develop, product/feature branches), plus open and stale branches with next steps. Use when the user asks for branch status, "hvordan står vi med branches", what is missing where across long-lived branches, or an overview to present to the team.
---

# Branch status overview

## Workflow

1. **Find the main branches and their merge flow.** Use what the user says. If they don't say, look at `git branch -r --sort=-committerdate`, merge commits (`git log --merges --first-parent`) and the remote HEAD. Order the branches from upstream to downstream, e.g. release → develop → product branch. If the flow is ambiguous, ask.

2. **Collect data.** Run the script with the target repo root as the working directory, passing the main branches in flow order:

   ```bash
   bash <this-skill-dir>/scripts/branch-status.sh -n 40 origin/<release> origin/<develop> origin/<product>
   ```

   For each pair of adjacent branches, it prints:
   - the commit gap in both directions
   - the last common base
   - first-parent PR lists

   It then prints a containment table for every other local and remote branch. In that table, `Y` means merged, `-N` means N commits are not merged, and `-0` means only merge commits are missing, so treat it as merged.

3. **Classify improvements** (merged PRs and branches) by where they are present:
   - **Only upstream, not merged down** (danger): needs to be merged downstream.
   - **Missing on release/upstream** (warning): merged downstream but not released yet.
   - **Only on one downstream branch** (info): note which items are generic and should be brought back upstream, and which are genuinely product-specific.
   - **Everywhere** (success).

   Group the improvements by area, e.g. Platform, Architecture, Quality, Test, Bugfix, Feature, Ops, Docs. Collapse small related PRs into one row and keep ticket IDs as references.

4. **Classify unmerged branches:**
   - **Ready for PR**: pushed and the work is complete.
   - **In progress**: WIP, local only, or diverged. For the current branch, also check `git status`.
   - **Can be cleaned up**: superseded by a merged PR, or stale for more than about a month.

5. **Build the canvas.** Read the canvas skill (`~/.cursor/skills-cursor/canvas/SKILL.md`). Then write `~/.cursor/projects/<workspace>/canvases/branch-status.canvas.tsx`, starting from [canvas-template.tsx](canvas-template.tsx). Replace every data array (`mains`, `gaps`, `improvements`, `pending`, `callouts`) with real results, and don't leave any example rows in.

6. **Reply in the user's language.** Lead with the conclusion: what is missing where, and what must be merged. Link the canvas. If open PRs couldn't be checked (no CLI for the git host), say that the overview only reflects what is merged in git.

## Notes

- Use `git log --first-parent` on each main branch to tell PR merges (`Merged PR …`) apart from direct merges. Label direct merges as "direct merge".
- Sync merges between main branches (e.g. "Merge branch 'release' into develop") aren't improvements. Leave them out of the improvements table.
