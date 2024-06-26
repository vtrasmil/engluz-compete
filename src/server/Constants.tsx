import {env} from "~/env.mjs";

export const MAX_NUM_PLAYERS_PER_ROOM = env.NEXT_PUBLIC_MAX_NUM_PLAYERS_PER_ROOM;
export const BAD_FOUR_LETTER_WORDS = ['ANUS', 'ARSE', 'CLIT', 'COCK', 'COON',
    'CUNT', 'DAGO', 'DAMN', 'DICK', 'DIKE', 'DYKE', 'FUCK', 'GOOK', 'HEEB', 'HELL',
    'HOMO', 'JIZZ', 'KIKE', 'KUNT', 'KYKE', 'MICK', 'MUFF', 'NAZI', 'PAKI', 'PISS',
    'POON', 'PUTO', 'SHIT', 'SHIZ', 'SLUT', 'SMEG', 'SPIC', 'TARD', 'TITS', 'TWAT',
    'TWIT', 'WANK'
];
export const UNKNOWN_ERROR_MESSAGE = 'Something went wrong. Please try again later.';