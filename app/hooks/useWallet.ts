"use client";

import { useCallback, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";

interface PhantomWallet {
	publicKey: PublicKey;
	connect: () => Promise<{ publicKey: string }>;
	[key: string]: unknown;
}

export interface WalletState {
	wallet: PhantomWallet | null;
	publicKey: PublicKey | null;
	isConnected: boolean;
	status: string | null;
	connect: () => Promise<void>;
}

export const useWallet = (): WalletState => {
	const [wallet, setWallet] = useState<PhantomWallet | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	const isConnected = useMemo(() => !!wallet?.publicKey, [wallet]);

	const connect = useCallback(async () => {
		const provider = (window as Window & { solana?: PhantomWallet }).solana;
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

	return {
		wallet,
		publicKey: wallet?.publicKey || null,
		isConnected,
		status,
		connect,
	};
};
