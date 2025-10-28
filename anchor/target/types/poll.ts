/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/poll.json`.
 */
export type Poll = {
  "address": "F3cGjvGtWfEFGsRTDwmTvD8LAiJ8h8MyXBxhDQc1hyEs",
  "metadata": {
    "name": "poll",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Decentralized Solana Poll Program"
  },
  "instructions": [
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "voterRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "poll"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "castVoteParams"
            }
          }
        }
      ]
    },
    {
      "name": "closePoll",
      "discriminator": [
        139,
        213,
        162,
        65,
        172,
        150,
        123,
        67
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "poll"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createPoll",
      "discriminator": [
        182,
        171,
        112,
        238,
        6,
        219,
        14,
        110
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createPollParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    },
    {
      "name": "voterRecord",
      "discriminator": [
        178,
        96,
        138,
        116,
        143,
        202,
        115,
        33
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "pollClosed",
      "msg": "Poll is already closed."
    },
    {
      "code": 6001,
      "name": "pollNotStarted",
      "msg": "Voting has not started yet."
    },
    {
      "code": 6002,
      "name": "pollEnded",
      "msg": "Voting has already ended."
    },
    {
      "code": 6003,
      "name": "alreadyVoted",
      "msg": "This voter has already cast a vote."
    },
    {
      "code": 6004,
      "name": "invalidOption",
      "msg": "Provided option index is invalid."
    },
    {
      "code": 6005,
      "name": "tooManyOptions",
      "msg": "Too many options supplied."
    },
    {
      "code": 6006,
      "name": "notEnoughOptions",
      "msg": "At least two options are required."
    },
    {
      "code": 6007,
      "name": "titleTooLong",
      "msg": "The poll title exceeds the allowed length."
    },
    {
      "code": 6008,
      "name": "descriptionTooLong",
      "msg": "The poll description exceeds the allowed length."
    },
    {
      "code": 6009,
      "name": "optionLabelTooLong",
      "msg": "One of the option labels exceeds the allowed length."
    },
    {
      "code": 6010,
      "name": "invalidSchedule",
      "msg": "The poll schedule is invalid."
    },
    {
      "code": 6011,
      "name": "pollStillActive",
      "msg": "The poll is still active."
    },
    {
      "code": 6012,
      "name": "voteOverflow",
      "msg": "Vote counter overflow."
    }
  ],
  "types": [
    {
      "name": "castVoteParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "optionIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "createPollParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seed",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "seed",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "vec": {
                "defined": {
                  "name": "voteOption"
                }
              }
            }
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isClosed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "voteOption",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "label",
            "type": "string"
          },
          {
            "name": "votes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voterRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poll",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "selectedOption",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
