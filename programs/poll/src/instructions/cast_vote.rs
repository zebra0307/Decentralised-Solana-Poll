use anchor_lang::prelude::*;

use crate::error::PollError;
use crate::state::{Poll, VoterRecord};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CastVoteParams {
    pub option_index: u8,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [b"poll", poll.creator.as_ref(), &poll.seed],
        bump = poll.bump
    )]
    pub poll: Account<'info, Poll>,
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        init_if_needed,
        payer = voter,
        space = VoterRecord::SPACE,
        seeds = [b"voter", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_record: Account<'info, VoterRecord>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CastVote>, params: CastVoteParams) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let voter_record = &mut ctx.accounts.voter_record;
    let clock = Clock::get()?;

    require!(!poll.is_closed, PollError::PollClosed);
    require!(clock.unix_timestamp >= poll.start_ts, PollError::PollNotStarted);
    require!(clock.unix_timestamp <= poll.end_ts, PollError::PollEnded);

    if voter_record.poll == poll.key() {
        return err!(PollError::AlreadyVoted);
    }

    let option_index = params.option_index as usize;
    require!(option_index < poll.options.len(), PollError::InvalidOption);
    require!(
        poll.options[option_index].votes < u64::MAX,
        PollError::VoteOverflow
    );

    poll.options[option_index].votes += 1;

    voter_record.poll = poll.key();
    voter_record.voter = ctx.accounts.voter.key();
    voter_record.selected_option = params.option_index;
    voter_record.bump = ctx.bumps.voter_record;

    Ok(())
}
