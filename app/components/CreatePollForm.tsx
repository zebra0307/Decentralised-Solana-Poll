import { BN } from "@coral-xyz/anchor";
import { CreatePollParams } from "../types/poll";
import { generateRandomSeed, getCurrentTimestamp } from "../utils/helpers";

interface CreatePollFormProps {
	isConnected: boolean;
	loading: boolean;
	onCreatePoll: (params: CreatePollParams) => Promise<void>;
}

export const CreatePollForm = ({
	isConnected,
	loading,
	onCreatePoll,
}: CreatePollFormProps) => {
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const title = String(form.get("title") ?? "").trim();
		const description = String(form.get("description") ?? "").trim();
		const options = String(form.get("options") ?? "")
			.split(",")
			.map((opt) => opt.trim())
			.filter(Boolean);
		const duration = Number(form.get("duration") ?? 3600);

		if (options.length < 2) {
			alert("Provide at least two comma-separated options.");
			return;
		}

		const seed = generateRandomSeed();
		const now = getCurrentTimestamp();

		await onCreatePoll({
			seed,
			title,
			description,
			options,
			startTs: new BN(now),
			endTs: new BN(now + duration),
		});

		event.currentTarget.reset();
	};

	return (
		<section className="p-6 bg-white shadow rounded">
			<h2 className="text-xl font-semibold mb-4">Create Poll</h2>
			<form onSubmit={handleSubmit} className="grid gap-4">
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
	);
};
