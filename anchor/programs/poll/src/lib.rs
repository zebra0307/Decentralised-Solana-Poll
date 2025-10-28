use anchor_lang::prelude::*;

declare_id!("F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs");

#[program]
pub mod poll {
    use super::*;

    pub fn create_poll(ctx: Context<CreatePoll>, params: CreatePollParams) -> Result<()> {
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

    pub fn cast_vote(ctx: Context<CastVote>, params: CastVoteParams) -> Result<()> {
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

    pub fn close_poll(ctx: Context<ClosePoll>) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let clock = Clock::get()?;

        require!(!poll.is_closed, PollError::PollClosed);
        require!(clock.unix_timestamp >= poll.end_ts, PollError::PollStillActive);

        poll.is_closed = true;

        Ok(())
    }
}

// Instruction parameters
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreatePollParams {
    pub seed: [u8; 8],
    pub title: String,
    pub description: String,
    pub options: Vec<String>,
    pub start_ts: i64,
    pub end_ts: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CastVoteParams {
    pub option_index: u8,
}

// Account contexts
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

// State accounts
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct VoteOption {
    pub label: String,
    pub votes: u64,
}

// Custom errors
#[error_code]
pub enum PollError {
    #[msg("Poll is already closed.")]
    PollClosed,
    #[msg("Voting has not started yet.")]
    PollNotStarted,
    #[msg("Voting has already ended.")]
    PollEnded,
    #[msg("This voter has already cast a vote.")]
    AlreadyVoted,
    #[msg("Provided option index is invalid.")]
    InvalidOption,
    #[msg("Too many options supplied.")]
    TooManyOptions,
    #[msg("At least two options are required.")]
    NotEnoughOptions,
    #[msg("The poll title exceeds the allowed length.")]
    TitleTooLong,
    #[msg("The poll description exceeds the allowed length.")]
    DescriptionTooLong,
    #[msg("One of the option labels exceeds the allowed length.")]
    OptionLabelTooLong,
    #[msg("The poll schedule is invalid.")]
    InvalidSchedule,
    #[msg("The poll is still active.")]
    PollStillActive,
    #[msg("Vote counter overflow.")]
    VoteOverflow,
}
