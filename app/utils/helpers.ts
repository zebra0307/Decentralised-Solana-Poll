import { BN } from "@coral-xyz/anchor";

/**
 * Format a timestamp (BN or number) to a human-readable date string
 */
export const formatTs = (value: BN | number): string => {
	const seconds = BN.isBN(value) ? value.toNumber() : value;
	return new Date(seconds * 1000).toLocaleString();
};

/**
 * Generate a random seed for creating a poll PDA
 */
export const generateRandomSeed = (): number[] => {
	return Array.from(crypto.getRandomValues(new Uint8Array(8)));
};

/**
 * Get current Unix timestamp in seconds
 */
export const getCurrentTimestamp = (): number => {
	return Math.floor(Date.now() / 1000);
};
