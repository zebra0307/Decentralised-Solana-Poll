# Architecture Visualization

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     app/page.tsx                           │ │
│  │                   (Main Orchestrator)                      │ │
│  │                                                            │ │
│  │  const walletState = useWallet()                          │ │
│  │  const pollState = usePoll(publicKey, wallet)             │ │
│  │                                                            │ │
│  │  return (                                                  │ │
│  │    <WalletSection {...walletState} />                     │ │
│  │    <CreatePollForm {...pollState} />                      │ │
│  │    <PollList {...pollState} />                            │ │
│  │  )                                                         │ │
│  └──────────┬──────────────────────────┬──────────────────┬──┘ │
│             │                          │                  │    │
│             ▼                          ▼                  ▼    │
│  ┌──────────────────┐    ┌────────────────────┐  ┌──────────┐ │
│  │  WalletSection   │    │  CreatePollForm    │  │ PollList │ │
│  │   Component      │    │    Component       │  │Component │ │
│  │                  │    │                    │  │          │ │
│  │ • Connect button │    │ • Title input      │  │• Polls[] │ │
│  │ • Status display │    │ • Description      │  │• Vote UI │ │
│  │ • Public key     │    │ • Options input    │  │• Close   │ │
│  └──────────────────┘    └────────────────────┘  └──────────┘ │
│             ▲                          ▲                  ▲    │
│             │                          │                  │    │
│             │        ┌─────────────────┴──────────────────┘    │
│             │        │                                         │
│  ┌──────────┴────────┴────────┐     ┌──────────────────────┐  │
│  │     useWallet Hook         │     │    usePoll Hook      │  │
│  │                            │     │                      │  │
│  │ • wallet state             │     │ • program instance   │  │
│  │ • publicKey                │     │ • polls[]            │  │
│  │ • isConnected              │     │ • createPoll()       │  │
│  │ • connect()                │     │ • castVote()         │  │
│  │ • status                   │     │ • closePoll()        │  │
│  └──────────┬─────────────────┘     └──────┬───────────────┘  │
│             │                              │                  │
│             ▼                              ▼                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Window.solana (Phantom Wallet)              │ │
│  │                                                          │ │
│  │  • connect()                                             │ │
│  │  • signTransaction()                                     │ │
│  │  • publicKey                                             │ │
│  └──────────────────────────┬───────────────────────────────┘ │
│                             │                                 │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │    Solana Blockchain          │
              │                               │
              │  ┌─────────────────────────┐  │
              │  │  Anchor Program (Rust)  │  │
              │  │                         │  │
              │  │  • create_poll          │  │
              │  │  • cast_vote            │  │
              │  │  • close_poll           │  │
              │  └─────────────────────────┘  │
              │                               │
              │  ┌─────────────────────────┐  │
              │  │   Poll Accounts (PDA)   │  │
              │  │                         │  │
              │  │  • creator              │  │
              │  │  • title, description   │  │
              │  │  • options[]            │  │
              │  │  • votes[]              │  │
              │  │  • timestamps           │  │
              │  └─────────────────────────┘  │
              └───────────────────────────────┘
```

## Module Dependency Graph

```
page.tsx
    │
    ├─► hooks/
    │   ├─► useWallet.ts
    │   │   └─► types/poll.ts
    │   │
    │   └─► usePoll.ts
    │       ├─► types/poll.ts
    │       ├─► lib/anchorClient.ts
    │       └─► lib/idl/poll.ts
    │
    └─► components/
        ├─► WalletSection.tsx
        │   └─► @solana/web3.js
        │
        ├─► CreatePollForm.tsx
        │   ├─► types/poll.ts
        │   └─► utils/helpers.ts
        │       └─► @coral-xyz/anchor
        │
        └─► PollList.tsx
            ├─► types/poll.ts
            └─► utils/helpers.ts
                └─► @coral-xyz/anchor
```

## Component Hierarchy

```
Home (page.tsx)
│
├─ WalletSection
│  ├─ <h1> Dashboard Title
│  ├─ <p> Description
│  ├─ <button> Connect Wallet
│  └─ <span> Public Key Display
│
├─ CreatePollForm
│  └─ <form>
│     ├─ <input> Title
│     ├─ <textarea> Description
│     ├─ <input> Options (comma-separated)
│     ├─ <input> Duration
│     └─ <button> Create Poll
│
└─ PollList
   ├─ <h2> Live Polls
   ├─ <button> Refresh
   └─ <ul>
      └─ <li> (for each poll)
         ├─ <h3> Poll Title
         ├─ <p> Description
         ├─ <span> Creator Address
         ├─ <div> Timestamps
         ├─ <div> (for each option)
         │  ├─ <span> Option & Votes
         │  └─ <button> Vote
         └─ <button> Close Poll (if creator)
```

## State Management Flow

```
┌───────────────────────────────────────────────────────────────┐
│                        Component Tree                          │
│                                                                │
│  page.tsx                                                      │
│    ├─ walletState = useWallet()                              │
│    │    ├─ wallet: PhantomWallet | null                       │
│    │    ├─ publicKey: PublicKey | null                        │
│    │    ├─ isConnected: boolean                               │
│    │    ├─ status: string | null                              │
│    │    └─ connect(): Promise<void>                           │
│    │                                                           │
│    ├─ pollState = usePoll(publicKey, wallet)                 │
│    │    ├─ program: Program<Poll> | null                      │
│    │    ├─ polls: PollAccount[]                               │
│    │    ├─ loading: boolean                                   │
│    │    ├─ status: string | null                              │
│    │    ├─ fetchPolls(): Promise<void>                        │
│    │    ├─ createPoll(params): Promise<void>                  │
│    │    ├─ castVote(poll, index): Promise<void>               │
│    │    └─ closePoll(poll): Promise<void>                     │
│    │                                                           │
│    ├─ <WalletSection />                                       │
│    │    Props: { isConnected, publicKey, status, onConnect }  │
│    │                                                           │
│    ├─ <CreatePollForm />                                      │
│    │    Props: { isConnected, loading, onCreatePoll }         │
│    │                                                           │
│    └─ <PollList />                                            │
│         Props: { polls, loading, isConnected, userPublicKey,  │
│                  onRefresh, onVote, onClose }                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘

State Updates Flow:
1. User clicks "Connect Wallet"
   → WalletSection.onConnect()
   → useWallet.connect()
   → Updates wallet state
   → Re-renders with isConnected=true

2. Connected wallet triggers program load
   → usePoll.loadProgram()
   → Updates program state
   → usePoll.fetchPolls()
   → Updates polls state
   → Re-renders PollList

3. User creates poll
   → CreatePollForm submits
   → usePoll.createPoll()
   → Blockchain transaction
   → usePoll.fetchPolls()
   → Updates polls state
   → Re-renders PollList

4. User votes
   → PollList.onVote()
   → usePoll.castVote()
   → Blockchain transaction
   → usePoll.fetchPolls()
   → Updates polls state
   → Re-renders PollList
```

## Type Safety Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Type Definitions Layer                    │
│                      (types/poll.ts)                         │
│                                                              │
│  export interface PollOption {                              │
│    label: string;                                           │
│    votes: BN;                                               │
│  }                                                           │
│                                                              │
│  export interface PollAccount {                             │
│    creator: PublicKey;                                      │
│    seed: number[];                                          │
│    title: string;                                           │
│    description: string;                                     │
│    options: PollOption[];                                   │
│    startTs: BN;                                             │
│    endTs: BN;                                               │
│    isClosed: boolean;                                       │
│  }                                                           │
│                                                              │
│  export interface CreatePollParams { ... }                  │
│  export interface CastVoteParams { ... }                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├──► Used by hooks/usePoll.ts
                  ├──► Used by components/CreatePollForm.tsx
                  └──► Used by components/PollList.tsx

Benefits:
✅ Single source of truth for types
✅ Compiler catches type mismatches
✅ IDE autocomplete works everywhere
✅ Refactoring is safer
```

## Testing Architecture

```
Unit Tests (Isolated)
├─ hooks/useWallet.test.ts
│  └─ Mock window.solana
│
├─ hooks/usePoll.test.ts
│  └─ Mock Anchor program
│
├─ components/WalletSection.test.tsx
│  └─ Mock props
│
├─ components/CreatePollForm.test.tsx
│  └─ Mock onCreatePoll
│
├─ components/PollList.test.tsx
│  └─ Mock polls array
│
└─ utils/helpers.test.ts
   └─ Pure function tests (no mocks needed!)

Integration Tests
├─ page.test.tsx
│  └─ Test full component tree with mocked blockchain
│
└─ e2e/poll-flow.test.ts
   └─ Test complete user journey
```

## Performance Considerations

```
Optimization Layer
│
├─ useMemo() in hooks
│  └─ Prevents unnecessary recalculations
│
├─ useCallback() for handlers
│  └─ Stable function references
│
├─ React.memo() on components (future)
│  └─ Prevent unnecessary re-renders
│
└─ Code splitting (automatic with Next.js)
   └─ Each component loads when needed
```

## Summary

This architecture provides:
- **Clear separation of concerns** (UI, logic, data)
- **Type safety throughout** the application
- **Easy to test** each layer independently
- **Scalable structure** for adding features
- **Developer-friendly** with barrel exports
- **Performance optimized** with React best practices
