import { PublicKey } from "@solana/web3.js";

interface WalletSectionProps {
	isConnected: boolean;
	publicKey: PublicKey | null;
	status: string | null;
	onConnect: () => void;
}

export const WalletSection = ({
	isConnected,
	publicKey,
	status,
	onConnect,
}: WalletSectionProps) => {
	return (
		<section className="p-6 bg-white shadow rounded space-y-4">
			<h1 className="text-2xl font-semibold">Solana Poll Dashboard</h1>
			<p className="text-sm text-slate-600">
				Create community polls, cast your vote, and close them once they expire.
			</p>
			<div className="flex items-center gap-3">
				<button
					type="button"
					disabled={isConnected}
					onClick={onConnect}
					className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-slate-400"
				>
					{isConnected ? "Wallet Connected" : "Connect Wallet"}
				</button>
				{publicKey && (
					<span className="text-xs font-mono text-slate-500">
						{publicKey.toBase58()}
					</span>
				)}
			</div>
			{status && <p className="text-sm text-slate-700">{status}</p>}
		</section>
	);
};
