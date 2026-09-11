---
name: auditing-git-contributions
description: Use when someone wants a documented, defensible list of their own contributions to a git repo - for a performance review, standup note, resume bullet, or a "here's what I actually did" moment in case anyone asks. Also use when asked to summarize who did what in a repo, or to turn commit history into a status/progress report.
---

# Auditing Git Contributions

## Overview

Turn git history into a short, honest list of what one person actually did - verified against the repo, not against memory or a prior summary. The point is defensibility: every claim in the output must trace back to a git command whose output you saw.

## When to Use

- "Make me a list of what I've done on this project" / "document my contributions"
- Prepping for a review, 1:1, or a moment where someone might question what got done
- Turning commit history into a progress report or changelog
- Re-running a contribution summary that was produced earlier (in this session or a past one) - always re-verify, never just reformat the old text

Don't use for: writing release notes for an audience other than the author (that's changelog work, different goals), or summarizing someone else's work without their commits as the source.

## Core Principle

**Never write down a claim you haven't just verified with git.** A prior AI summary, a memory note, or "I'm pretty sure I did X" are all starting hypotheses, not facts. Re-run the commands every time - identities, date ranges and commit categorization drift, and old summaries silently inflate over time as they get copied forward.

## Steps

1. **Confirm the exact git identity.** Display names lie; the email in git config is truth.
   ```bash
   git log -1 --pretty=format:"%an <%ae>" --author="<name-or-partial-email>"
   ```
2. **Establish the period.** Use whatever range the person gives you, or find their first commit:
   ```bash
   git log --author="<email>" --no-merges --reverse --pretty=format:"%ad %h %s" --date=short | head -1
   ```
3. **Get the honest share, not a cherry-picked one.** Compare against everyone else in the same window - not against the repo's entire history, which buries a 5-week contributor under a 3-year one:
   ```bash
   git shortlog -sn --no-merges --since="<start-date>" HEAD
   ```
4. **Pull the full commit list for that author and window:**
   ```bash
   git log --author="<email>" --no-merges --since="<start-date>" --pretty=format:"%ad %s" --date=short --reverse
   ```
5. **Group into a handful of themes**, using clusters that fall out of the actual commit messages (setup/infra, a specific refactor, a feature, ops, tests). Don't invent a category with no commits behind it, and don't let one category swallow work that's really a different phase.
6. **Write the list in the person's own language and voice.** Plain bullets, short lines, no marketing adjectives, no headers-for-the-sake-of-headers - match whatever "raw/simple" or "formal report" register was asked for.
7. **Attach a Sources block** with the exact commands run, so the list is reproducible by anyone, including a skeptical reader.
8. **Flag what git can't prove.** Infra/ops work done outside the repo, verbal architecture decisions, a WIP commit message that oversells what actually landed ("Upgrading to .NET 10" as one commit is not a completed migration) - call these out as things the person should confirm themselves, never assert them as settled fact.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Reusing a previous summary's numbers without re-running git | Re-run every command, every time - state drifts |
| "My commits" as % of ALL repo history | Scope the comparison to the same date window for everyone |
| Treating a WIP/attempted commit message as a finished feature | Read the actual diff or later commits before claiming it landed |
| Adding categories or achievements not backed by a commit message | If it's not in git and not confirmed by the person, it's a flag, not a bullet |
| Over-formatting when "raw simple list" was requested | Plain bullets beat tables/headers/emoji for this use case |
