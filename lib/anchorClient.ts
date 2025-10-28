import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { IDL, Poll } from "./idl/poll";

export const PROGRAM_ID = new PublicKey("F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs");
const DEFAULT_ENDPOINT = "https://api.devnet.solana.com";
const COMMITMENT = "confirmed";

type WalletAdapter = {
	publicKey: PublicKey;
	signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>;
	signAllTransactions?: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>;
};

const encoder = new TextEncoder();
const POLL_PREFIX = encoder.encode("poll");
const VOTER_PREFIX = encoder.encode("voter");

const normalizeSeed = (seed: readonly number[] | Uint8Array) =>
	(seed instanceof Uint8Array ? seed : Uint8Array.from(seed));

const ensureWallet = (wallet: WalletAdapter): AnchorProvider["wallet"] => {
	return {
		publicKey: wallet.publicKey,
		signTransaction: wallet.signTransaction,
		signAllTransactions: wallet.signAllTransactions ?? (async (txs) => {
			return Promise.all(txs.map(tx => wallet.signTransaction(tx)));
		}),
	};
};

export const getProvider = (wallet: WalletAdapter, endpoint = DEFAULT_ENDPOINT) =>
	new AnchorProvider(new Connection(endpoint, COMMITMENT), ensureWallet(wallet), {
		commitment: COMMITMENT,
	});

// IDL type compatibility with Anchor - uses explicit type casting for newer versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProgram = (wallet: WalletAdapter, endpoint = DEFAULT_ENDPOINT): Program<Poll> =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new Program(IDL as any, getProvider(wallet, endpoint)) as any;

export const derivePollPda = (creator: PublicKey, seed: readonly number[] | Uint8Array) =>
	PublicKey.findProgramAddressSync(
		[POLL_PREFIX, creator.toBuffer(), normalizeSeed(seed)],
		PROGRAM_ID,
	);

export const deriveVoterRecordPda = (poll: PublicKey, voter: PublicKey) =>
	PublicKey.findProgramAddressSync(
		[VOTER_PREFIX, poll.toBuffer(), voter.toBuffer()],
		PROGRAM_ID,
	);
