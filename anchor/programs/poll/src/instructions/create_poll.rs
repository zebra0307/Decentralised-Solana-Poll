use anchor_lang::prelude::*;

use crate::error::PollError;
use crate::state::{Poll, VoteOption};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreatePollParams {
    pub seed: [u8; 8],
    pub title: String,
    pub description: String,
    pub options: Vec<String>,
    pub start_ts: i64,
    pub end_ts: i64,
}

#[derive(Accounts)]
#[instruction(params: CreatePollParams)]
pub struct CreatePoll<'info> {
    #[account(
        init,
        payer = authority,
        space = Poll::SPACE,
        seeds = [b"poll", authority.key().as_ref(), &params.seed],
        bump
    )]
    pub poll: Account<'info, Poll>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreatePoll>, params: CreatePollParams) -> Result<()> {
    let CreatePollParams {
        seed,
        title,
        description,
        mut options,
        start_ts,
        end_ts,
    } = params;

    require!(options.len() >= 2, PollError::NotEnoughOptions);
    require!(options.len() <= Poll::MAX_OPTIONS, PollError::TooManyOptions);
    require!(title.as_bytes().len() <= Poll::MAX_TITLE_LEN, PollError::TitleTooLong);
    require!(
        description.as_bytes().len() <= Poll::MAX_DESCRIPTION_LEN,
        PollError::DescriptionTooLong
    );
    require!(end_ts > start_ts, PollError::InvalidSchedule);

    let mut vote_options = Vec::with_capacity(options.len());
    for option in options.drain(..) {
        require!(
            option.as_bytes().len() <= Poll::MAX_OPTION_LABEL_LEN,
            PollError::OptionLabelTooLong
        );
        vote_options.push(VoteOption {
            label: option,
            votes: 0,
        });
    }

    let poll = &mut ctx.accounts.poll;
    poll.creator = ctx.accounts.authority.key();
    poll.seed = seed;
    poll.title = title;
    poll.description = description;
    poll.options = vote_options;
    poll.start_ts = start_ts;
    poll.end_ts = end_ts;
    poll.bump = ctx.bumps.poll;
    poll.is_closed = false;

    Ok(())
}
