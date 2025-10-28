import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export interface PollOption {
	label: string;
	votes: BN;
}

export interface PollAccount {
	creator: PublicKey;
	seed: number[];
	title: string;
	description: string;
	options: PollOption[];
	startTs: BN;
	endTs: BN;
	isClosed: boolean;
}

export interface CreatePollParams {
	seed: number[];
	title: string;
	description: string;
	options: string[];
	startTs: BN;
	endTs: BN;
}

export interface CastVoteParams {
	optionIndex: number;
}
