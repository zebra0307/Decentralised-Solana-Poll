import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { Poll } from "../../../target/types/poll";

describe("poll program", () => {
	anchor.setProvider(anchor.AnchorProvider.env());
	const provider = anchor.getProvider() as anchor.AnchorProvider;
	const program = anchor.workspace.Poll as Program<Poll>;
	const creator = provider.wallet;

	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	it("creates, votes, and closes a poll", async () => {
		const seed = Array.from(Buffer.from("seed0001"));
		const [pollPda] = PublicKey.findProgramAddressSync(
			[Buffer.from("poll"), creator.publicKey.toBuffer(), Buffer.from(seed)],
			program.programId,
		);

		const now = Math.floor(Date.now() / 1000);
		await program.methods
			.createPoll({
				seed,
				title: "Anchor Poll",
				description: "Lifecycle test",
				options: ["Yes", "No"],
				startTs: new anchor.BN(now - 60),
				endTs: new anchor.BN(now + 5),
			})
			.accounts({
				poll: pollPda,
				authority: creator.publicKey,
			})
			.rpc();

		const pollAccount = await program.account.poll.fetch(pollPda);
		expect(pollAccount.title).to.equal("Anchor Poll");
		expect(pollAccount.options[0].votes.toNumber()).to.equal(0);

		const voter = Keypair.generate();
		await provider.connection.confirmTransaction(
			await provider.connection.requestAirdrop(voter.publicKey, 2 * LAMPORTS_PER_SOL),
		);
		const [voterRecordPda] = PublicKey.findProgramAddressSync(
			[Buffer.from("voter"), pollPda.toBuffer(), voter.publicKey.toBuffer()],
			program.programId,
		);

		await program.methods
			.castVote({ optionIndex: 0 })
			.accounts({
				poll: pollPda,
				voter: voter.publicKey,
				voterRecord: voterRecordPda,
			})
			.signers([voter])
			.rpc();

		const updatedPoll = await program.account.poll.fetch(pollPda);
		expect(updatedPoll.options[0].votes.toNumber()).to.equal(1);

		await sleep(6000);
		await program.methods
			.closePoll()
			.accounts({
				poll: pollPda,
			})
			.rpc();

		const closed = await program.account.poll.fetch(pollPda);
		expect(closed.isClosed).to.be.true;
	});
});
