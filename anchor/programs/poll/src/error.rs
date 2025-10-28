use anchor_lang::prelude::*;

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
