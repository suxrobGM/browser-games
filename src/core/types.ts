import { Category } from "@core/enums";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type GameConfig = {
    gameId: string;
    displayName: string;
    category: Category;
    timerLimit?: number;
}

export type SessionData = {
    gameId: string;
    playerId: string;
    sessionId: string;
    rank: number;
    highscore: number;
    level: number;
    timestamp?: number;
    signature?: string;
}