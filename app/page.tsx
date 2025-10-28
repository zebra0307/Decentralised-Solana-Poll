"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { derivePollPda, deriveVoterRecordPda, getProgram } from "../lib/anchorClient";
import { Poll } from "../lib/idl/poll";

// @ts-ignore - Type compatibility with legacy IDL format
type PollAccount = any;

const formatTs = (value: BN | number) => {
	const seconds = BN.isBN(value) ? value.toNumber() : value;
	return new Date(seconds * 1000).toLocaleString();
};

export default function Home() {
	const [wallet, setWallet] = useState<any>(null);
	// @ts-ignore - Type compatibility with legacy IDL format
	const [program, setProgram] = useState<Program<Poll> | null>(null);
	const [polls, setPolls] = useState<PollAccount[]>([]);
	const [status, setStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isConnected = useMemo(() => !!wallet?.publicKey, [wallet]);

	const connectWallet = useCallback(async () => {
		const provider = (window as any).solana;
		if (!provider) {
			setStatus("Install a Solana wallet (e.g. Phantom) to continue.");
			return;
		}
		try {
			const response = await provider.connect();
			setWallet({ ...provider, publicKey: new PublicKey(response.publicKey) });
			setStatus("Wallet connected.");
		} catch (err) {
			setStatus(`Wallet connection failed: ${(err as Error).message}`);
		}
	}, []);

	const loadProgram = useCallback(async () => {
		if (!wallet?.publicKey) return;
		try {
			const instance = getProgram(wallet);
			setProgram(instance);
		} catch (err) {
			setStatus(`Unable to init program: ${(err as Error).message}`);
		}
	}, [wallet]);

	const fetchPolls = useCallback(async () => {
		if (!program) return;
		setLoading(true);
		try {
			// @ts-ignore - Account type compatibility
			const accounts = await program.account.poll.all();
			setPolls(accounts.map((entry: any) => entry.account));
			setStatus(null);
		} catch (err) {
			setStatus(`Failed to fetch polls: ${(err as Error).message}`);
		} finally {
			setLoading(false);
		}
	}, [program]);

	useEffect(() => {
		loadProgram();
	}, [loadProgram]);

	useEffect(() => {
		fetchPolls();
	}, [fetchPolls]);

	const handleCreate = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!program || !wallet?.publicKey) return;
			const form = new FormData(event.currentTarget);
			const title = String(form.get("title") ?? "").trim();
			const description = String(form.get("description") ?? "").trim();
			const options = String(form.get("options") ?? "")
				.split(",")
				.map((opt) => opt.trim())
				.filter(Boolean);
			const duration = Number(form.get("duration") ?? 3600);
			if (options.length < 2) {
				setStatus("Provide at least two comma-separated options.");
				return;
			}

			const seed = Array.from(crypto.getRandomValues(new Uint8Array(8)));
			const [pollPda] = derivePollPda(wallet.publicKey, seed);
			const now = Math.floor(Date.now() / 1000);

			try{
				setLoading(true);
				setStatus("Creating poll…");
				await program.methods
					.createPoll({
						seed,
						title,
						description,
						options,
						startTs: new BN(now),
						endTs: new BN(now + duration),
					})
					.accounts({
						poll: pollPda,
						authority: wallet.publicKey,
					})
					.rpc();
				event.currentTarget.reset();
				await fetchPolls();
				setStatus("Poll created.");
			} catch (err) {
				setStatus(`Create failed: ${(err as Error).message}`);
			} finally {
				setLoading(false);
			}
		},
		[fetchPolls, program, wallet?.publicKey],
	);

	const handleVote = useCallback(
		async (poll: PollAccount, optionIndex: number) => {
			if (!program || !wallet?.publicKey) return;
			const [pollPda] = derivePollPda(new PublicKey(poll.creator), poll.seed);
			const [voterPda] = deriveVoterRecordPda(pollPda, wallet.publicKey);
			try {
				setLoading(true);
				setStatus("Casting vote…");
				await program.methods
					.castVote({ optionIndex })
					.accounts({
						poll: pollPda,
						voter: wallet.publicKey,
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
		[fetchPolls, program, wallet?.publicKey],
	);

	const handleClose = useCallback(
		async (poll: PollAccount) => {
			if (!program || !wallet?.publicKey) return;
			const creator = new PublicKey(poll.creator);
			if (!creator.equals(wallet.publicKey)) {
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
		[fetchPolls, program, wallet?.publicKey],
	);

	return (
		<main className="space-y-6">
			<section className="p-6 bg-white shadow rounded space-y-4">
				<h1 className="text-2xl font-semibold">Solana Poll Dashboard</h1>
				<p className="text-sm text-slate-600">
					Create community polls, cast your vote, and close them once they expire.
				</p>
				<div className="flex items-center gap-3">
					<button
						type="button"
						disabled={isConnected}
						onClick={connectWallet}
						className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-slate-400"
					>
						{isConnected ? "Wallet Connected" : "Connect Wallet"}
					</button>
					{wallet?.publicKey && (
						<span className="text-xs font-mono text-slate-500">
							{wallet.publicKey.toBase58()}
						</span>
					)}
				</div>
				{status && <p className="text-sm text-slate-700">{status}</p>}
			</section>

			<section className="p-6 bg-white shadow rounded">
				<h2 className="text-xl font-semibold mb-4">Create Poll</h2>
				<form onSubmit={handleCreate} className="grid gap-4">
					<input
						name="title"
						placeholder="Title"
						required
						className="border rounded px-3 py-2"
					/>
					<textarea
						name="description"
						placeholder="Description"
						required
						className="border rounded px-3 py-2"
						rows={3}
					/>
					<input
						name="options"
						placeholder="Comma-separated options"
						required
						className="border rounded px-3 py-2"
					/>
					<label className="flex flex-col text-sm text-slate-600 gap-1">
						<span>Poll duration (seconds)</span>
						<input
							name="duration"
							type="number"
							min={60}
							defaultValue={3600}
							className="border rounded px-3 py-2"
						/>
					</label>
					<button
						type="submit"
						disabled={!isConnected || loading}
						className="px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-slate-400"
					>
						Create Poll
					</button>
				</form>
			</section>

			<section className="p-6 bg-white shadow rounded space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Live Polls</h2>
					<button
						type="button"
						onClick={fetchPolls}
						disabled={loading}
						className="px-3 py-2 text-sm border rounded"
					>
						Refresh
					</button>
				</div>
				{polls.length === 0 && <p className="text-sm text-slate-600">No polls found yet.</p>}
				<ul className="space-y-4">
					{polls.map((poll) => (
						<li key={new PublicKey(poll.creator).toBase58() + poll.title} className="border rounded p-4 space-y-3">
							<header className="flex flex-col gap-1">
								<h3 className="text-lg font-semibold">{poll.title}</h3>
								<p className="text-sm text-slate-600">{poll.description}</p>
								<span className="text-xs text-slate-500 font-mono">
									Creator: {new PublicKey(poll.creator).toBase58()}
								</span>
								<div className="text-xs text-slate-500 flex gap-2">
									<span>Starts: {formatTs(poll.startTs)}</span>
									<span>Ends: {formatTs(poll.endTs)}</span>
									<span>Status: {poll.isClosed ? "Closed" : "Open"}</span>
								</div>
							</header>
							<div className="space-y-2">
								{poll.options.map((option: { label: string; votes: BN }, index: number) => (
									<div key={option.label} className="flex items-center justify-between border rounded px-3 py-2">
										<span>
											{option.label} — {option.votes.toNumber()} vote
											{option.votes.toNumber() === 1 ? "" : "s"}
										</span>
										<button
											type="button"
											disabled={!isConnected || poll.isClosed || loading}
											onClick={() => handleVote(poll, index)}
											className="px-3 py-1 text-sm bg-indigo-600 text-white rounded disabled:bg-slate-400"
										>
											Vote
										</button>
									</div>
								))}
							</div>
							{isConnected && new PublicKey(poll.creator).equals(wallet.publicKey) && (
								<button
									type="button"
									disabled={poll.isClosed || loading}
									onClick={() => handleClose(poll)}
									className="px-3 py-2 text-sm bg-rose-600 text-white rounded disabled:bg-slate-400"
								>
									Close Poll
								</button>
							)}
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
