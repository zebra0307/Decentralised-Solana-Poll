"use client";

import { useCallback, useEffect, useState } from "react";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { derivePollPda, deriveVoterRecordPda, getProgram } from "../../lib/anchorClient";
import { Poll } from "../../lib/idl/poll";
import { PollAccount, CreatePollParams } from "../types/poll";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletAdapter = any;

export interface UsePollReturn {
	program: Program<Poll> | null;
	polls: PollAccount[];
	status: string | null;
	loading: boolean;
	fetchPolls: () => Promise<void>;
	createPoll: (params: CreatePollParams) => Promise<void>;
	castVote: (poll: PollAccount, optionIndex: number) => Promise<void>;
	closePoll: (poll: PollAccount) => Promise<void>;
}

export const usePoll = (walletPublicKey: PublicKey | null, wallet: WalletAdapter): UsePollReturn => {
	const [program, setProgram] = useState<Program<Poll> | null>(null);
	const [polls, setPolls] = useState<PollAccount[]>([]);
	const [status, setStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const loadProgram = useCallback(async () => {
		if (!walletPublicKey || !wallet) return;
		try {
			const instance = getProgram(wallet);
			setProgram(instance);
		} catch (err) {
			setStatus(`Unable to init program: ${(err as Error).message}`);
		}
	}, [wallet, walletPublicKey]);

	const fetchPolls = useCallback(async () => {
		if (!program) return;
		setLoading(true);
		try {
			const accounts = await program.account.poll.all();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			setPolls(accounts.map((entry: any) => entry.account));
			setStatus(null);
		} catch (err) {
			setStatus(`Failed to fetch polls: ${(err as Error).message}`);
		} finally {
			setLoading(false);
		}
	}, [program]);

	const createPoll = useCallback(
		async (params: CreatePollParams) => {
			if (!program || !walletPublicKey) return;

			const [pollPda] = derivePollPda(walletPublicKey, params.seed);

			try {
				setLoading(true);
				setStatus("Creating poll…");
				await program.methods
					.createPoll(params)
					.accounts({
						poll: pollPda,
						authority: walletPublicKey,
					})
					.rpc();
				await fetchPolls();
				setStatus("Poll created.");
			} catch (err) {
				setStatus(`Create failed: ${(err as Error).message}`);
			} finally {
				setLoading(false);
			}
		},
		[fetchPolls, program, walletPublicKey]
	);

	const castVote = useCallback(
		async (poll: PollAccount, optionIndex: number) => {
			if (!program || !walletPublicKey) return;
			const [pollPda] = derivePollPda(new PublicKey(poll.creator), poll.seed);
			// Voter record PDA derivation (kept for potential future use)
			deriveVoterRecordPda(pollPda, walletPublicKey);

			try {
				setLoading(true);
				setStatus("Casting vote…");
				await program.methods
					.castVote({ optionIndex })
					.accounts({
						poll: pollPda,
						voter: walletPublicKey,
					})
					.rpc();
				await fetchPolls();
				setStatus("Vote recorded.");
			} catch (err) {
				setStatus(`Vote failed: ${(err as Error).message}`);
			} finally {
				setLoading(false);
			}
		},
		[fetchPolls, program, walletPublicKey]
	);

	const closePoll = useCallback(
		async (poll: PollAccount) => {
			if (!program || !walletPublicKey) return;
			const creator = new PublicKey(poll.creator);
			if (!creator.equals(walletPublicKey)) {
				setStatus("Only the poll creator can close it.");
				return;
			}
			const [pollPda] = derivePollPda(creator, poll.seed);

			try {
				setLoading(true);
				setStatus("Closing poll…");
				await program.methods
					.closePoll()
					.accounts({
						poll: pollPda,
					})
					.rpc();
				await fetchPolls();
				setStatus("Poll closed.");
			} catch (err) {
				setStatus(`Close failed: ${(err as Error).message}`);
			} finally {
				setLoading(false);
			}
		},
		[fetchPolls, program, walletPublicKey]
	);

	useEffect(() => {
		loadProgram();
	}, [loadProgram]);

	useEffect(() => {
		fetchPolls();
	}, [fetchPolls]);

	return {
		program,
		polls,
		status,
		loading,
		fetchPolls,
		createPoll,
		castVote,
		closePoll,
	};
};
