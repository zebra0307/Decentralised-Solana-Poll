use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct VoteOption {
    pub label: String,
    pub votes: u64,
}

#[account]
pub struct Poll {
    pub creator: Pubkey,
    pub seed: [u8; 8],
    pub title: String,
    pub description: String,
    pub options: Vec<VoteOption>,
    pub start_ts: i64,
    pub end_ts: i64,
    pub bump: u8,
    pub is_closed: bool,
}

impl Poll {
    pub const MAX_OPTIONS: usize = 8;
    pub const MAX_TITLE_LEN: usize = 64;
    pub const MAX_DESCRIPTION_LEN: usize = 256;
    pub const MAX_OPTION_LABEL_LEN: usize = 32;

    pub const SPACE: usize = 8
        + 32
        + 8
        + (4 + Self::MAX_TITLE_LEN)
        + (4 + Self::MAX_DESCRIPTION_LEN)
        + (4 + Self::MAX_OPTIONS * (4 + Self::MAX_OPTION_LABEL_LEN + 8))
        + 8
        + 8
        + 1
        + 1;
}

#[account]
pub struct VoterRecord {
    pub poll: Pubkey,
    pub voter: Pubkey,
    pub selected_option: u8,
    pub bump: u8,
}

impl VoterRecord {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 1;
}
