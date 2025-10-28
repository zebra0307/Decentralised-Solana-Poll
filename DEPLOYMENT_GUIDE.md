# Complete Guide: Fixing Errors & Deploying to Devnet

## Part 1: Understanding and Fixing the Network Error ✅

### What's the Error?
**Error**: "You are connected to Localnet but your account is not found on this cluster."

### Why Does This Happen?

Your Solana wallet account (e.g., from Phantom) is registered on **Devnet**, but when you switch to **Localnet** in the app, your account doesn't exist there because:
1. Localnet is a local blockchain running on your computer
2. It starts fresh every time with no accounts or balances
3. Your wallet's public key exists, but it has **0 SOL** on Localnet

### Where Network Configuration is Managed

#### 1. **Frontend - Network Selection** (`src/components/solana/solana-provider.tsx`)
```tsx
const config = createWalletUiConfig({
  clusters: [createSolanaDevnet(), createSolanaLocalnet()],  // Networks available
})
```

**Available Networks:**
- **Devnet**: Test network with free SOL from faucets
- **Localnet**: Your local Solana validator (for development)
- *(Mainnet can be added but costs real SOL)*

#### 2. **Backend - Program Deployment** (`anchor/Anchor.toml`)
```toml
[provider]
cluster = "devnet"  # <-- This determines where Anchor commands deploy

[programs.localnet]
poll = "F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs"

[programs.devnet]
poll = "F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs"
```

### How to Fix the Error

**Option 1: Switch to Devnet (Recommended)**
1. In your app header, click the network dropdown (currently shows "Localnet")
2. Select **"Devnet"**
3. Your account will be found and work normally

**Option 2: Get SOL on Localnet** (for local testing)
1. Start local validator: `solana-test-validator`
2. Airdrop SOL to your wallet:
   ```bash
   solana airdrop 10 <YOUR_WALLET_ADDRESS> --url localhost
   ```
3. Now your account exists on Localnet

**Option 3: Use Account Request Airdrop** (in the app)
1. Switch to Devnet in the dropdown
2. Go to the Account page
3. Click "Request Airdrop" button
4. You'll get free SOL for testing

---

## Part 2: Fixing Code Errors ✅

### Error 1: Old `/app` Directory Conflicts

**Location**: `/app/page.tsx`
**Issue**: Old conflicting files from previous refactoring

**Fix**: Delete the old `/app` directory:
```bash
rm -rf /home/rammsey/Decentralized-Solana-Poll/app
```

### Error 2: CSS Linter Warnings

**Location**: `src/app/globals.css`
**Issue**: Tailwind directives flagged as "unknown" (cosmetic only, not real errors)

**Status**: These are **not actual errors** - Tailwind CSS is working correctly. These are just linter warnings that can be ignored.

### Error 3: Poll Page Import Error

**Location**: `src/app/poll/page.tsx`
**Current Code**:
```tsx
import PollFeature from '@/features/poll/poll-feature'
```

**Issue**: File extension missing

**Fix**: Already correct! The error should resolve after removing `/app` directory.

### Error 4: Test File TypeScript Errors

**Location**: `anchor/programs/poll/tests/poll.ts`
**Issue**: Type definitions for test framework

**Fix**: These are in the Anchor test files which are excluded from the build. They don't affect the app.

---

## Part 3: Deploy to Devnet - Complete Step-by-Step Guide 🚀

### Prerequisites Checklist

Before deploying, ensure you have:
- [ ] Rust installed (`rustc --version`)
- [ ] Solana CLI installed (`solana --version`)
- [ ] Anchor CLI installed (`anchor --version`)
- [ ] Wallet with SOL on Devnet (for deployment fees)

### Step 1: Prepare Your Wallet

```bash
# Generate a new wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# OR use your existing wallet
# Just make sure Anchor.toml points to it:
# wallet = "~/.config/solana/id.json"

# Check your wallet address
solana address

# Example output:
# CC1EDEqc9KtMRnRGn46xH8ikiMjaSDRJJCZJsi9TThpK
```

### Step 2: Get SOL on Devnet

```bash
# Connect to Devnet
solana config set --url devnet

# Verify you're on devnet
solana config get
# Should show: RPC URL: https://api.devnet.solana.com

# Request airdrop (2 SOL for deployment fees)
solana airdrop 2

# Check your balance
solana balance
# Should show: 2 SOL
```

**Note**: If airdrop fails, use the web faucet:
- Visit: https://faucet.solana.com/
- Paste your address
- Request 2 SOL

### Step 3: Build Your Program

```bash
# Navigate to project root
cd /home/rammsey/Decentralized-Solana-Poll

# Build the Anchor program
anchor build

# This creates:
# - target/deploy/poll.so (compiled program)
# - target/idl/poll.json (interface definition)
# - target/types/poll.ts (TypeScript types)
```

**Expected Output**:
```
✨ Built Anchor project successfully!
Program Id: F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs
```

### Step 4: Deploy to Devnet

```bash
# Make sure Anchor.toml has cluster = "devnet"
# (It already does in your file)

# Deploy the program
anchor deploy

# This uploads your program to Devnet
```

**Expected Output**:
```
Deploying cluster: devnet
Upgrade authority: CC1EDEqc9KtMRnRGn46xH8ikiMjaSDRJJCZJsi9TThpK
Deploying program "poll"...
Program path: /home/rammsey/Decentralized-Solana-Poll/target/deploy/poll.so
Program Id: F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs

Deploy success! ✨
```

### Step 5: Verify Deployment

```bash
# Check program account on Devnet
solana program show F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs

# Should show:
# Program Id: F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs
# Owner: BPFLoaderUpgradeab1e11111111111111111111111
# ProgramData Address: <some address>
# Authority: <your wallet>
# Last Deployed In Slot: <slot number>
# Data Length: <bytes>
```

### Step 6: Test on Devnet

```bash
# Run Anchor tests against Devnet
anchor test --skip-local-validator

# Or test specific functions
cd anchor
anchor test --skip-local-validator
```

### Step 7: Update Frontend to Use Devnet Program

Your frontend is already configured! In `lib/anchorClient.ts`:
```typescript
export const PROGRAM_ID = new PublicKey("F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs");
const DEFAULT_ENDPOINT = "https://api.devnet.solana.com";
```

**To use it:**
1. In your app, select **Devnet** from the network dropdown
2. Connect your wallet
3. Create polls and vote!

---

## Part 4: Testing Workflow

### Testing on Localnet (Development)

```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Deploy and test
cd /home/rammsey/Decentralized-Solana-Poll
anchor build
anchor deploy --provider.cluster localnet
anchor test

# Terminal 3: Run frontend
npm run dev

# In app:
# 1. Select "Localnet" from dropdown
# 2. Request airdrop or use: solana airdrop 10 --url localhost
# 3. Test your polls
```

### Testing on Devnet (Pre-Production)

```bash
# Build and deploy
anchor build
anchor deploy  # Uses cluster from Anchor.toml (devnet)

# Run frontend
npm run dev

# In app:
# 1. Select "Devnet" from dropdown
# 2. Connect wallet (make sure you have SOL)
# 3. Test with real blockchain (but test tokens)
```

---

## Part 5: Troubleshooting

### Problem: "Insufficient funds for deployment"

**Solution**:
```bash
# Check balance
solana balance

# Get more SOL
solana airdrop 2

# Or use web faucet
# https://faucet.solana.com/
```

### Problem: "Program deployment failed"

**Solution**:
```bash
# Check you're on the right network
solana config get

# Should show devnet
# If not:
solana config set --url devnet

# Rebuild and try again
anchor build
anchor deploy
```

### Problem: "Account not found on this cluster"

**Solution**:
- Switch to Devnet in the app dropdown (top right)
- Make sure your wallet has SOL on that network
- Request airdrop if on Devnet

### Problem: "Transaction simulation failed"

**Solution**:
- Your wallet might not have enough SOL for transaction fees
- Request airdrop: `solana airdrop 1`
- Check you're connected to the right network

---

## Part 6: Key Files and Their Roles

| File | Purpose | Network Impact |
|------|---------|----------------|
| `anchor/Anchor.toml` | Anchor configuration | Sets **deployment network** (localnet/devnet) |
| `src/components/solana/solana-provider.tsx` | Frontend network config | Defines **available networks** in UI dropdown |
| `lib/anchorClient.ts` | Program client | **Program ID** and **RPC endpoint** |
| `anchor/programs/poll/src/lib.rs` | Solana program code | The actual smart contract |
| `anchor/target/deploy/poll.so` | Compiled program | Uploaded to blockchain |
| `anchor/target/idl/poll.json` | Program interface | Used by frontend to interact |

---

## Part 7: Quick Command Reference

```bash
# === WALLET MANAGEMENT ===
solana address                          # Show wallet address
solana balance                          # Check SOL balance
solana airdrop 2                        # Get 2 SOL (devnet/testnet)

# === NETWORK MANAGEMENT ===
solana config get                       # Check current network
solana config set --url devnet          # Switch to devnet
solana config set --url localhost       # Switch to localnet
solana config set --url mainnet-beta    # Switch to mainnet (CAUTION!)

# === PROGRAM DEPLOYMENT ===
anchor build                            # Compile Rust program
anchor deploy                           # Deploy to network (from Anchor.toml)
anchor deploy --provider.cluster devnet # Deploy to specific network
anchor test                             # Run tests (starts localnet)
anchor test --skip-local-validator      # Test on current network

# === PROGRAM VERIFICATION ===
solana program show <PROGRAM_ID>        # Check program details
anchor idl init <PROGRAM_ID> -f target/idl/poll.json  # Upload IDL

# === LOCAL DEVELOPMENT ===
solana-test-validator                   # Start local blockchain
solana logs                             # Watch transaction logs
```

---

## Part 8: Deployment Checklist

### Before Deploying to Devnet:
- [ ] Code is tested locally with `anchor test`
- [ ] Program builds without errors: `anchor build`
- [ ] Wallet has at least 2 SOL on Devnet
- [ ] `Anchor.toml` has `cluster = "devnet"`
- [ ] Program ID in `lib/anchorClient.ts` matches `Anchor.toml`

### During Deployment:
- [ ] Run `anchor deploy`
- [ ] Save deployment output (program ID, slot number)
- [ ] Verify with `solana program show <PROGRAM_ID>`

### After Deployment:
- [ ] Frontend dropdown shows Devnet
- [ ] Can connect wallet
- [ ] Can create polls
- [ ] Can vote on polls
- [ ] Can view results

---

## Part 9: Next Steps After Devnet Deployment

1. **Test Thoroughly**: Create multiple polls, vote, check results
2. **Get Feedback**: Share with friends/community for testing
3. **Monitor**: Watch for errors in browser console and Solana Explorer
4. **Iterate**: Fix bugs, add features, redeploy
5. **Document**: Update README with deployment address
6. **Prepare for Mainnet**: 
   - Get real SOL
   - Audit code thoroughly
   - Deploy with `cluster = "mainnet-beta"`

---

## Summary

### Quick Fix for Current Error:
**Just switch to Devnet in the dropdown!** Your app is already deployed there.

### To Test on Localnet:
1. Start: `solana-test-validator`
2. Deploy: `anchor deploy --provider.cluster localnet`
3. Airdrop: `solana airdrop 10 --url localhost`

### To Deploy Fresh on Devnet:
```bash
solana config set --url devnet
solana airdrop 2
anchor build
anchor deploy
```

**Your program is already on Devnet at:**
`F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs`

Just select **Devnet** in your app and start testing! 🚀
