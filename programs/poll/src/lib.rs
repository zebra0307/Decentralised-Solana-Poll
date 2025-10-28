use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::{CastVote, CastVoteParams, ClosePoll, CreatePoll, CreatePollParams};

pub use instructions::{CastVoteParams, CreatePollParams};
pub use state::*;

declare_id!("Po111111111111111111111111111111111111111");

#[program]
pub mod poll {
    use super::*;

    pub fn create_poll(ctx: Context<CreatePoll>, params: CreatePollParams) -> Result<()> {
        instructions::create_poll::handler(ctx, params)
    }

    pub fn cast_vote(ctx: Context<CastVote>, params: CastVoteParams) -> Result<()> {
        instructions::cast_vote::handler(ctx, params)
    }

    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        instructions::close_poll::handler(ctx)
    }
}
