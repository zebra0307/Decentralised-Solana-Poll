export type Poll = {
	address: string;
	metadata: {
		name: string;
		version: string;
		spec: string;
	};
	version: "0.1.0";
	name: "poll";
	instructions: [
		{
			name: "createPoll";
			accounts: [
				{ name: "poll"; isMut: true; isSigner: false },
				{ name: "authority"; isMut: true; isSigner: true },
				{ name: "systemProgram"; isMut: false; isSigner: false }
			];
			args: [{ name: "params"; type: { defined: "CreatePollParams" } }];
		},
		{
			name: "castVote";
			accounts: [
				{ name: "poll"; isMut: true; isSigner: false },
				{ name: "voter"; isMut: true; isSigner: true },
				{ name: "voterRecord"; isMut: true; isSigner: false },
				{ name: "systemProgram"; isMut: false; isSigner: false }
			];
			args: [{ name: "params"; type: { defined: "CastVoteParams" } }];
		},
		{
			name: "closePoll";
			accounts: [
				{ name: "poll"; isMut: true; isSigner: false },
				{ name: "creator"; isMut: false; isSigner: true }
			];
			args: [];
		}
	];
	accounts: [
		{
			name: "poll";
			type: {
				kind: "struct";
				fields: [
					{ name: "creator"; type: "publicKey" },
					{ name: "seed"; type: { array: ["u8", 8] } },
					{ name: "title"; type: "string" },
					{ name: "description"; type: "string" },
					{ name: "options"; type: { vec: { defined: "VoteOption" } } },
					{ name: "startTs"; type: "i64" },
					{ name: "endTs"; type: "i64" },
					{ name: "bump"; type: "u8" },
					{ name: "isClosed"; type: "bool" }
				];
			};
		},
		{
			name: "voterRecord";
			type: {
				kind: "struct";
				fields: [
					{ name: "poll"; type: "publicKey" },
					{ name: "voter"; type: "publicKey" },
					{ name: "selectedOption"; type: "u8" },
					{ name: "bump"; type: "u8" }
				];
			};
		}
	];
	types: [
		{
			name: "VoteOption";
			type: {
				kind: "struct";
				fields: [
					{ name: "label"; type: "string" },
					{ name: "votes"; type: "u64" }
				];
			};
		},
		{
			name: "CreatePollParams";
			type: {
				kind: "struct";
				fields: [
					{ name: "seed"; type: { array: ["u8", 8] } },
					{ name: "title"; type: "string" },
					{ name: "description"; type: "string" },
					{ name: "options"; type: { vec: "string" } },
					{ name: "startTs"; type: "i64" },
					{ name: "endTs"; type: "i64" }
				];
			};
		},
		{
			name: "CastVoteParams";
			type: {
				kind: "struct";
				fields: [{ name: "optionIndex"; type: "u8" }];
			};
		}
	];
	errors: [
		{ code: 6000; name: "PollClosed"; msg: "Poll is already closed." },
		{ code: 6001; name: "PollNotStarted"; msg: "Voting has not started yet." },
		{ code: 6002; name: "PollEnded"; msg: "Voting has already ended." },
		{ code: 6003; name: "AlreadyVoted"; msg: "This voter has already cast a vote." },
		{ code: 6004; name: "InvalidOption"; msg: "Provided option index is invalid." },
		{ code: 6005; name: "TooManyOptions"; msg: "Too many options supplied." },
		{ code: 6006; name: "NotEnoughOptions"; msg: "At least two options are required." },
		{ code: 6007; name: "TitleTooLong"; msg: "The poll title exceeds the allowed length." },
		{ code: 6008; name: "DescriptionTooLong"; msg: "The poll description exceeds the allowed length." },
		{ code: 6009; name: "OptionLabelTooLong"; msg: "One of the option labels exceeds the allowed length." },
		{ code: 6010; name: "InvalidSchedule"; msg: "The poll schedule is invalid." },
		{ code: 6011; name: "PollStillActive"; msg: "The poll is still active." },
		{ code: 6012; name: "VoteOverflow"; msg: "Vote counter overflow." }
	];
};

export const IDL: Poll = {
	address: "Po111111111111111111111111111111111111111",
	metadata: {
		name: "poll",
		version: "0.1.0",
		spec: "0.1.0"
	},
	version: "0.1.0",
	name: "poll",
	instructions: [
		{
			name: "createPoll",
			accounts: [
				{ name: "poll", isMut: true, isSigner: false },
				{ name: "authority", isMut: true, isSigner: true },
				{ name: "systemProgram", isMut: false, isSigner: false }
			],
			args: [{ name: "params", type: { defined: "CreatePollParams" } }]
		},
		{
			name: "castVote",
			accounts: [
				{ name: "poll", isMut: true, isSigner: false },
				{ name: "voter", isMut: true, isSigner: true },
				{ name: "voterRecord", isMut: true, isSigner: false },
				{ name: "systemProgram", isMut: false, isSigner: false }
			],
			args: [{ name: "params", type: { defined: "CastVoteParams" } }]
		},
		{
			name: "closePoll",
			accounts: [
				{ name: "poll", isMut: true, isSigner: false },
				{ name: "creator", isMut: false, isSigner: true }
			],
			args: []
		}
	],
	accounts: [
		{
			name: "poll",
			type: {
				kind: "struct",
				fields: [
					{ name: "creator", type: "publicKey" },
					{ name: "seed", type: { array: ["u8", 8] } },
					{ name: "title", type: "string" },
					{ name: "description", type: "string" },
					{ name: "options", type: { vec: { defined: "VoteOption" } } },
					{ name: "startTs", type: "i64" },
					{ name: "endTs", type: "i64" },
					{ name: "bump", type: "u8" },
					{ name: "isClosed", type: "bool" }
				]
			}
		},
		{
			name: "voterRecord",
			type: {
				kind: "struct",
				fields: [
					{ name: "poll", type: "publicKey" },
					{ name: "voter", type: "publicKey" },
					{ name: "selectedOption", type: "u8" },
					{ name: "bump", type: "u8" }
				]
			}
		}
	],
	types: [
		{
			name: "VoteOption",
			type: {
				kind: "struct",
				fields: [
					{ name: "label", type: "string" },
					{ name: "votes", type: "u64" }
				]
			}
		},
		{
			name: "CreatePollParams",
			type: {
				kind: "struct",
				fields: [
					{ name: "seed", type: { array: ["u8", 8] } },
					{ name: "title", type: "string" },
					{ name: "description", type: "string" },
					{ name: "options", type: { vec: "string" } },
					{ name: "startTs", type: "i64" },
					{ name: "endTs", type: "i64" }
				]
			}
		},
		{
			name: "CastVoteParams",
			type: {
				kind: "struct",
				fields: [{ name: "optionIndex", type: "u8" }]
			}
		}
	],
	errors: [
		{ code: 6000, name: "PollClosed", msg: "Poll is already closed." },
		{ code: 6001, name: "PollNotStarted", msg: "Voting has not started yet." },
		{ code: 6002, name: "PollEnded", msg: "Voting has already ended." },
		{ code: 6003, name: "AlreadyVoted", msg: "This voter has already cast a vote." },
		{ code: 6004, name: "InvalidOption", msg: "Provided option index is invalid." },
		{ code: 6005, name: "TooManyOptions", msg: "Too many options supplied." },
		{ code: 6006, name: "NotEnoughOptions", msg: "At least two options are required." },
		{ code: 6007, name: "TitleTooLong", msg: "The poll title exceeds the allowed length." },
		{ code: 6008, name: "DescriptionTooLong", msg: "The poll description exceeds the allowed length." },
		{ code: 6009, name: "OptionLabelTooLong", msg: "One of the option labels exceeds the allowed length." },
		{ code: 6010, name: "InvalidSchedule", msg: "The poll schedule is invalid." },
		{ code: 6011, name: "PollStillActive", msg: "The poll is still active." },
		{ code: 6012, name: "VoteOverflow", msg: "Vote counter overflow." }
	]
};
