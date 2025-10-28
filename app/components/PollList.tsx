import { PublicKey } from "@solana/web3.js";
import { PollAccount } from "../types/poll";
import { formatTs } from "../utils/helpers";

interface PollListProps {
	polls: PollAccount[];
	loading: boolean;
	isConnected: boolean;
	userPublicKey: PublicKey | null;
	onRefresh: () => void;
	onVote: (poll: PollAccount, optionIndex: number) => void;
	onClose: (poll: PollAccount) => void;
}

export const PollList = ({
	polls,
	loading,
	isConnected,
	userPublicKey,
	onRefresh,
	onVote,
	onClose,
}: PollListProps) => {
	return (
		<section className="p-6 bg-white shadow rounded space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Live Polls</h2>
				<button
					type="button"
					onClick={onRefresh}
					disabled={loading}
					className="px-3 py-2 text-sm border rounded"
				>
					Refresh
				</button>
			</div>
			{polls.length === 0 && (
				<p className="text-sm text-slate-600">No polls found yet.</p>
			)}
			<ul className="space-y-4">
				{polls.map((poll) => {
					const pollCreator = new PublicKey(poll.creator);
					const isCreator = userPublicKey && pollCreator.equals(userPublicKey);

					return (
						<li
							key={pollCreator.toBase58() + poll.title}
							className="border rounded p-4 space-y-3"
						>
							<header className="flex flex-col gap-1">
								<h3 className="text-lg font-semibold">{poll.title}</h3>
								<p className="text-sm text-slate-600">{poll.description}</p>
								<span className="text-xs text-slate-500 font-mono">
									Creator: {pollCreator.toBase58()}
								</span>
								<div className="text-xs text-slate-500 flex gap-2">
									<span>Starts: {formatTs(poll.startTs)}</span>
									<span>Ends: {formatTs(poll.endTs)}</span>
									<span>Status: {poll.isClosed ? "Closed" : "Open"}</span>
								</div>
							</header>
							<div className="space-y-2">
								{poll.options.map((option, index) => (
									<div
										key={option.label}
										className="flex items-center justify-between border rounded px-3 py-2"
									>
										<span>
											{option.label} — {option.votes.toNumber()} vote
											{option.votes.toNumber() === 1 ? "" : "s"}
										</span>
										<button
											type="button"
											disabled={!isConnected || poll.isClosed || loading}
											onClick={() => onVote(poll, index)}
											className="px-3 py-1 text-sm bg-indigo-600 text-white rounded disabled:bg-slate-400"
										>
											Vote
										</button>
									</div>
								))}
							</div>
							{isConnected && isCreator && (
								<button
									type="button"
									disabled={poll.isClosed || loading}
									onClick={() => onClose(poll)}
									className="px-3 py-2 text-sm bg-rose-600 text-white rounded disabled:bg-slate-400"
								>
									Close Poll
								</button>
							)}
						</li>
					);
				})}
			</ul>
		</section>
	);
};
