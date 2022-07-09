import { Category } from "@core/enums";
import { GameConfig } from "@core/types";

export const Config: GameConfig = {
    gameId: "memo",
    displayName: "Memo",
    category: Category.Memory,
    timerLimit: 45
}