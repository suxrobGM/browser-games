import { GameConfig, SessionData } from "@core/types";
import { SceneBase } from "@core/scenes/sceneBase";
import { Level } from "@core/level";

export class Context {
    public readonly assetsPath: string;
    public readonly bootstrapper: string;
    public readonly config: GameConfig;
    public readonly levels: Level[]
    public readonly scenes: Map<string, typeof SceneBase>;
    public sessionData: SessionData;
    public callbackUrl: string;

    constructor(config: GameConfig, bootScene: string) {
        this.assetsPath = `assets/${config.gameId}`;
        this.bootstrapper = bootScene;
        this.config = config;
        this.levels = [];
        this.scenes = new Map<string, typeof SceneBase>();
    }

    public getCurrentLevel(): Level {
        if (this.levels.length < 1) {
            throw new Error("Not defined any levels, add at least one game's level");
        }
        
        let currentLevel = null;

        if (this.sessionData?.level) {
            currentLevel = this.levels.find(i => i.value === this.sessionData.level);

            if (!currentLevel) {
                throw new Error("Passed undefined level as an argument to the game's query");
            }
        }
        else {
            currentLevel = this.levels[0];
        }

        return currentLevel;
    }

    public getNextLevel(): Level {
        let nextLevel = null;
        const currentLevel = this.getCurrentLevel();
        const index = this.levels.findIndex(level => level.value === currentLevel.value);

        if (index !== this.levels.length - 1) {
            nextLevel = this.levels[index + 1];
        } 
        else {
            nextLevel = currentLevel;
        }
        return nextLevel;
    }
}