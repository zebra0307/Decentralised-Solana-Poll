# Poll Program Overview

## Folder map
- `src/state.rs` — persistent account types (`Poll`, `VoterRecord`) and sizing limits.
- `src/error.rs` — custom errors grouped for reuse across handlers.
- `src/instructions/` — instruction-specific account validation and business rules.
  - `create_poll.rs` — creation flow with schedule/length guards.
  - `cast_vote.rs` — voting flow with single-vote enforcement.
  - `close_poll.rs` — closing logic gated by creator and schedule.
- `tests/` — Anchor mocha tests that exercise the full lifecycle.

## Compactness discussion
Handlers are already factored to keep each instruction self-contained. Further compaction (e.g. merging all instruction code into one file or replacing explicit checks with helper macros) is possible but would reduce clarity and debuggability, so the current split balances readability with reuse.

## Build & test
```bash
anchor build
anchor test
```

Run a local validator for iterative work:
```bash
solana-test-validator
anchor deploy
```

## Frontend
Install deps once (`npm install` at repo root) and launch:
```bash
npm run dev
```
