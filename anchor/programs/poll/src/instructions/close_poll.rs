use anchor_lang::prelude::*;

use crate::error::PollError;
use crate::state::Poll;

#[derive(Accounts)]
pub struct ClosePoll<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [b"poll", poll.creator.as_ref(), &poll.seed],
        bump = poll.bump
    )]
    pub poll: Account<'info, Poll>,
    pub creator: Signer<'info>,
}

pub fn handler(ctx: Context<ClosePoll>) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let clock = Clock::get()?;

    require!(!poll.is_closed, PollError::PollClosed);
    require!(clock.unix_timestamp >= poll.end_ts, PollError::PollStillActive);

    poll.is_closed = true;

    Ok(())
}
