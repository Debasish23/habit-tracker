# Specification

## Summary
**Goal:** Add user authentication with per-user habit isolation and a clickable bar popup in the monthly chart.

**Planned changes:**
- Add a login/signup page as the entry point for unauthenticated users, using Internet Identity, that redirects to HabitsPage on successful login.
- Update the backend to scope all habit data (getHabits, createHabit, deleteHabit, markComplete, unmarkComplete) to the authenticated caller's principal so habits are never shared between users.
- Generate a migration file to preserve existing habit data during the backend state schema upgrade.
- Add a popup/tooltip to the MonthlyHabitsChart that appears when a bar is clicked, showing the date and list of habits completed on that day (with an empty state message if none), dismissible by clicking outside or clicking the bar again.

**User-visible outcome:** Users must log in via Internet Identity before accessing their habits, each user sees only their own habits, and clicking a bar in the monthly chart shows a popup listing the habits completed on that day.
