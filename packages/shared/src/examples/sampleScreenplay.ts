import type { ScreenplayDocument } from "../screenplayTypes.js";
import { SCREENPLAY_SCHEMA_VERSION } from "../screenplayTypes.js";

export const sampleScreenplay: ScreenplayDocument = {
  schema_version: SCREENPLAY_SCHEMA_VERSION,
  metadata: {
    title: "Lanterns Over River Street",
    source_chapters: [
      {
        chapter_id: "chapter_01",
        chapter_title: "The Letter at Dawn",
        chapter_order: 1,
        summary: "Lin Xia discovers a letter that reveals her missing brother may still be alive."
      },
      {
        chapter_id: "chapter_02",
        chapter_title: "Market of Rumors",
        chapter_order: 2,
        summary: "She searches the old market and learns the city watch is hiding a prison transfer."
      },
      {
        chapter_id: "chapter_03",
        chapter_title: "Rain on the Watchtower",
        chapter_order: 3,
        summary: "Lin Xia confronts the watch captain and forces a choice between loyalty and truth."
      }
    ],
    genre: "drama thriller",
    language: "zh-CN",
    adaptation_mode: "dramatic",
    logline:
      "A determined courier follows a trail of rumors across three chapters to uncover whether her brother survived a political purge.",
    adaptation_notes: [
      "Compressed travel beats into a smaller set of scenes for stage readability.",
      "Raised the captain's hesitation earlier to make the central conflict visible sooner."
    ]
  },
  characters: [
    {
      id: "char_lin_xia",
      name: "Lin Xia",
      role: "protagonist",
      description: "A young courier who hides grief behind stubborn focus.",
      motivation: "Find proof that her brother is alive and expose the cover-up.",
      speech_style: "Direct, clipped, and emotionally restrained until pressure breaks through.",
      relationships: [
        {
          character_id: "char_captain_zhou",
          relation: "adversarial ally",
          description: "Distrusts him but senses he knows more than he admits."
        }
      ]
    },
    {
      id: "char_captain_zhou",
      name: "Captain Zhou",
      role: "antagonist",
      description: "A city watch captain torn between duty and conscience.",
      motivation: "Contain the scandal without destroying the few people he can still protect.",
      speech_style: "Measured and formal, with long pauses when he is cornered.",
      relationships: [
        {
          character_id: "char_lin_xia",
          relation: "gatekeeper",
          description: "Blocks her investigation while quietly testing whether she can be trusted."
        }
      ]
    }
  ],
  locations: [
    {
      id: "loc_river_market",
      name: "River Street Market",
      description: "A covered market stacked with lantern stalls, gossip, and sudden hiding places.",
      atmosphere: "Crowded, wet, and tense beneath a cheerful public face."
    },
    {
      id: "loc_watchtower",
      name: "East Watchtower",
      description: "A stone tower overlooking the city gate and the prison road.",
      atmosphere: "Windy, exposed, and charged with official secrecy."
    }
  ],
  scenes: [
    {
      id: "scene_market_reveal",
      title: "Rumors Under Lantern Light",
      chapter_refs: [
        "chapter_01",
        "chapter_02"
      ],
      location_id: "loc_river_market",
      time_of_day: "evening",
      characters: [
        "char_lin_xia",
        "char_captain_zhou"
      ],
      summary: "Lin Xia corners Captain Zhou in the market and forces him to react to the missing transfer record.",
      conflict: "Lin Xia needs the truth now, while Zhou needs to keep the transfer hidden until he can control the fallout.",
      beats: [
        {
          id: "beat_market_probe",
          summary: "Lin Xia uses the letter and a missing ledger page to challenge the official story.",
          purpose: "Expose that the prison transfer is the dramatic hinge of the adaptation.",
          source_chapter_ids: [
            "chapter_01",
            "chapter_02"
          ]
        },
        {
          id: "beat_market_slip",
          summary: "Zhou accidentally confirms that the transfer happened during a storm night.",
          purpose: "Move the investigation toward the watchtower confrontation.",
          source_chapter_ids: [
            "chapter_02"
          ]
        }
      ],
      dialogue: [
        {
          character_id: "char_lin_xia",
          line: "You sealed the road record after midnight. Men do not hide an empty cart.",
          emotion: "controlled anger",
          action: "She places the damp ledger scrap on the lantern table."
        },
        {
          character_id: "char_captain_zhou",
          line: "Lower your voice. If you are right, the danger did not end with your brother.",
          emotion: "strained caution",
          action: "He shields the scrap with his sleeve before nearby merchants can see it."
        }
      ],
      stage_directions: [
        {
          id: "dir_market_noise",
          instruction: "Vendors call prices over the scene while rain taps the awning hard enough to mask short silences."
        }
      ],
      adaptation_notes: [
        "Merged multiple rumor exchanges into one confrontation to accelerate act momentum."
      ]
    },
    {
      id: "scene_watchtower_choice",
      title: "The Watchtower Confession",
      chapter_refs: [
        "chapter_03"
      ],
      location_id: "loc_watchtower",
      time_of_day: "night",
      characters: [
        "char_lin_xia",
        "char_captain_zhou"
      ],
      summary: "At the watchtower, Zhou finally admits the transfer was real and gives Lin Xia the route ledger.",
      conflict: "Zhou must choose between obeying corrupt orders and handing Lin Xia the evidence she needs.",
      beats: [
        {
          id: "beat_tower_standoff",
          summary: "Lin Xia blocks the tower stair and refuses to leave without the route ledger.",
          purpose: "Force the moral choice into a contained two-character scene.",
          source_chapter_ids: [
            "chapter_03"
          ]
        },
        {
          id: "beat_tower_release",
          summary: "Zhou surrenders the ledger and warns her that the route ends outside the city walls.",
          purpose: "Close the sequence with forward momentum for the next adaptation stage.",
          source_chapter_ids: [
            "chapter_03"
          ]
        }
      ],
      dialogue: [
        {
          character_id: "char_captain_zhou",
          line: "I signed the transfer, but I never signed their burial order.",
          emotion: "confession",
          action: "He removes the ledger from inside his coat and sets it on the railing."
        },
        {
          character_id: "char_lin_xia",
          line: "Then help me finish what they were too afraid to erase.",
          emotion: "grim resolve",
          action: "She takes the ledger without breaking eye contact."
        }
      ],
      stage_directions: [
        {
          id: "dir_tower_wind",
          instruction: "A strong wind pushes the tower door open and keeps the lantern flame unstable."
        }
      ],
      adaptation_notes: [
        "Converted the chapter's internal hesitation into spoken confession for stronger dramatic payoff."
      ]
    }
  ],
  quality_hints: {
    coverage_notes: [
      "All three source chapters are referenced across the current scene set."
    ],
    character_consistency_notes: [
      "Lin Xia remains action-first in both scenes; keep later rewrites from making her overly explanatory."
    ],
    pacing_notes: [
      "The adaptation jumps quickly from discovery to confrontation by design; add a quiet beat only if emotional breathing room is needed."
    ],
    revision_suggestions: [
      "Add one supporting-market witness in a future draft if the confrontation needs more public pressure.",
      "Track whether the brother should appear on stage or remain an off-screen objective."
    ]
  }
};
