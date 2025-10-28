"use client";

import { useWallet, usePoll } from "./hooks";
import { WalletSection, CreatePollForm, PollList } from "./components";

export default function Home() {
	const walletState = useWallet();
	const pollState = usePoll(walletState.publicKey, walletState.wallet);

	return (
		<main className="space-y-6">
			<WalletSection
				isConnected={walletState.isConnected}
				publicKey={walletState.publicKey}
				status={walletState.status || pollState.status}
				onConnect={walletState.connect}
			/>

			<CreatePollForm
				isConnected={walletState.isConnected}
				loading={pollState.loading}
				onCreatePoll={pollState.createPoll}
			/>

			<PollList
				polls={pollState.polls}
				loading={pollState.loading}
				isConnected={walletState.isConnected}
				userPublicKey={walletState.publicKey}
				onRefresh={pollState.fetchPolls}
				onVote={pollState.castVote}
				onClose={pollState.closePoll}
			/>
		</main>
	);
}
