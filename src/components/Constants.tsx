import {env} from "~/env.mjs";

export const MIN_WORD_LENGTH = env.NEXT_PUBLIC_MIN_WORD_LENGTH;
export const NUM_ROUNDS_PER_GAME = env.NEXT_PUBLIC_NUM_ROUNDS_PER_GAME;
export const ROLL_CHANGE_COLOR = 'lightgreen';
export const CELL_CHANGE_COLOR = 'gold';
export const SELECTED_COLOR = 'lightskyblue';
export const SUBMITTED_COLOR = 'lightgreen';
export const CONFIRMED_COLOR = 'green';
export const ROUND_DURATION = 10 * 1000;
export const INTERMISSION_DURATION = 10 * 1000;