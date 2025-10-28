# App Directory Structure

This directory contains the refactored Next.js application code organized into modular, reusable components.

## Directory Structure

```
app/
├── page.tsx                    # Main page component (orchestrates all modules) - 35 lines
├── layout.tsx                  # App layout wrapper
├── globals.css                 # Global styles
├── components/                 # Reusable UI components
│   ├── index.ts               # Barrel export for components
│   ├── WalletSection.tsx      # Wallet connection UI - 38 lines
│   ├── CreatePollForm.tsx     # Poll creation form - 92 lines
│   └── PollList.tsx           # Poll list and voting UI - 95 lines
├── hooks/                      # Custom React hooks
│   ├── index.ts               # Barrel export for hooks
│   ├── useWallet.ts           # Wallet connection logic - 50 lines
│   └── usePoll.ts             # Poll CRUD operations - 160 lines
├── types/                      # TypeScript type definitions
│   └── poll.ts                # Poll-related types and interfaces - 30 lines
└── utils/                      # Utility functions
    └── helpers.ts             # Helper functions - 24 lines
```

## Before vs After

### Before Refactoring
- **Single File**: `page.tsx` with ~300 lines
- **Mixed Concerns**: UI, logic, types, and utilities all in one place
- **Hard to Test**: Tightly coupled code
- **Difficult to Navigate**: Long scroll to find specific functionality

### After Refactoring
- **Modular Structure**: 10+ focused files
- **Clear Separation**: Each file has a single responsibility
- **Easy to Test**: Isolated hooks and components
- **Better Organization**: Find what you need quickly

## Module Overview

### Main Page (`page.tsx`)
```tsx
import { useWallet, usePoll } from "./hooks";
import { WalletSection, CreatePollForm, PollList } from "./components";

export default function Home() {
	const walletState = useWallet();
	const pollState = usePoll(walletState.publicKey, walletState.wallet);
	
	return (
		<main className="space-y-6">
			<WalletSection {...walletState} status={...} onConnect={...} />
			<CreatePollForm {...pollState} isConnected={...} />
			<PollList {...pollState} userPublicKey={...} />
		</main>
	);
}
```

**Key Benefits:**
- Reduced from ~300 to ~35 lines (88% reduction)
- Declarative component composition
- Minimal business logic
- Easy to understand at a glance

### Hooks

#### `useWallet.ts`
Manages Phantom wallet connection state.

**Exports:**
```ts
interface WalletState {
	wallet: PhantomWallet | null;
	publicKey: PublicKey | null;
	isConnected: boolean;
	status: string | null;
	connect: () => Promise<void>;
}
```

**Usage:**
```tsx
const { publicKey, isConnected, connect } = useWallet();
```

#### `usePoll.ts`
Manages all poll-related operations and state.

**Exports:**
```ts
interface UsePollReturn {
	program: Program<Poll> | null;
	polls: PollAccount[];
	loading: boolean;
	status: string | null;
	fetchPolls: () => Promise<void>;
	createPoll: (params: CreatePollParams) => Promise<void>;
	castVote: (poll: PollAccount, optionIndex: number) => Promise<void>;
	closePoll: (poll: PollAccount) => Promise<void>;
}
```

**Usage:**
```tsx
const { polls, createPoll, castVote } = usePoll(publicKey, wallet);
```

### Components

#### `WalletSection.tsx`
Displays wallet connection UI.

**Props:**
- `isConnected`: boolean
- `publicKey`: PublicKey | null
- `status`: string | null
- `onConnect`: () => void

#### `CreatePollForm.tsx`
Form for creating new polls with validation.

**Props:**
- `isConnected`: boolean
- `loading`: boolean
- `onCreatePoll`: (params: CreatePollParams) => Promise<void>

**Features:**
- Form validation
- Duration configuration
- Comma-separated options parsing

#### `PollList.tsx`
Displays polls with voting and management actions.

**Props:**
- `polls`: PollAccount[]
- `loading`: boolean
- `isConnected`: boolean
- `userPublicKey`: PublicKey | null
- `onRefresh`: () => void
- `onVote`: (poll, index) => void
- `onClose`: (poll) => void

**Features:**
- Real-time vote counts
- Creator-only close button
- Poll status display (Open/Closed)

### Types (`types/poll.ts`)

Centralized type definitions:
- `PollAccount`: Main poll data structure
- `PollOption`: Individual poll option with votes
- `CreatePollParams`: Poll creation parameters
- `CastVoteParams`: Vote casting parameters

### Utils (`utils/helpers.ts`)

Utility functions:
- `formatTs()`: Format BN/number timestamps to readable dates
- `generateRandomSeed()`: Generate random 8-byte seeds for PDAs
- `getCurrentTimestamp()`: Get current Unix timestamp in seconds

## Key Design Patterns

### 1. Custom Hooks Pattern
Encapsulates stateful logic and side effects, making them reusable across components.

### 2. Barrel Exports
`index.ts` files provide clean import paths:
```ts
// Instead of:
import { WalletSection } from "./components/WalletSection";
import { CreatePollForm } from "./components/CreatePollForm";

// You can write:
import { WalletSection, CreatePollForm } from "./components";
```

### 3. Separation of Concerns
- **Hooks**: State management and business logic
- **Components**: Presentation and user interaction
- **Types**: Type safety and contracts
- **Utils**: Pure functions and helpers

### 4. Props Interface Pattern
Each component has a well-defined props interface, making the API clear and type-safe.

## Benefits of This Structure

1. **Maintainability**: Changes are localized to specific files
2. **Testability**: Each module can be tested in isolation
3. **Reusability**: Components and hooks can be used in multiple pages
4. **Readability**: Shorter files are easier to understand
5. **Scalability**: Easy to add new features without bloating existing files
6. **Type Safety**: Centralized types prevent inconsistencies
7. **Developer Experience**: Clear file organization speeds up development

## Testing Strategy

With this structure, you can easily test:

```tsx
// Test hooks independently
import { renderHook } from '@testing-library/react-hooks';
import { useWallet } from './hooks';

test('useWallet connects successfully', async () => {
	const { result } = renderHook(() => useWallet());
	await result.current.connect();
	expect(result.current.isConnected).toBe(true);
});

// Test components independently
import { render, screen } from '@testing-library/react';
import { WalletSection } from './components';

test('WalletSection displays connect button', () => {
	render(<WalletSection isConnected={false} ... />);
	expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
});
```

## Next Steps

Consider these enhancements:
- [ ] Add unit tests for hooks and components
- [ ] Extract constants to `app/constants.ts`
- [ ] Add error boundary components
- [ ] Implement loading skeletons
- [ ] Add animations with Framer Motion
- [ ] Create a `usePolls` hook that combines `useWallet` and `usePoll`
- [ ] Add JSDoc comments to all exported functions

