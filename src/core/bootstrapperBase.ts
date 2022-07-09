/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Context } from "@core/context";
import { SceneBase } from "@core/scenes/sceneBase";
import { Level } from "@core/level";
import { GameConfig, SessionData } from "@core/types";

export abstract class BootstrapperBase extends SceneBase {
    private readonly _context: Context;
    private readonly _bootstrapperKey: string;

    constructor(config: GameConfig, type: typeof SceneBase) {
        super(`${config.gameId}_bootstrapper`);
        this._bootstrapperKey = `${config.gameId}_bootstrapper`;
        this._context = new Context(config, this._bootstrapperKey);
        this.addScene(this._bootstrapperKey, type);
        this.validateConfig(config);
        this.registerScenes();
    }

    protected abstract getStartupScene(): string;
    protected abstract registerLevels(): void;
    protected abstract registerScenes(): void;

    public init(data?: any): void {
        this.registerLevels();
        const callbackUrl = this.registry.get("callbackUrl") as string;
        const sessionData = this.registry.get("sessionData") as SessionData;
        this._context.callbackUrl = callbackUrl;
        this._context.sessionData = sessionData;

        this._context.sessionData.level = Number.parseInt(sessionData.level.toString());
        this._context.sessionData.rank = Number.parseInt(sessionData.rank.toString());
        this._context.sessionData.highscore = Number.parseInt(sessionData.highscore.toString());
        this._context.sessionData.timestamp = Number.parseInt(sessionData.timestamp.toString());
        this.registry.set("context", this._context);
        super.init(data);
    }

    protected onCreate(data?: any): void {
        this.scene.start(this.getStartupScene());
    }

    public get context(): Context {
        return this._context;
    }

    public getBootstrapper(): string {
        return this._bootstrapperKey;
    }

    public addLevel(level: Level) {
        const lastLevel = this.context.levels[this.context.levels.length - 1];
        const levelValue = this.context.levels.length < 1 ? 1 : lastLevel.value + 1;
        level.value = levelValue;
        this.context.levels.push(level);
    }

    public addScene(key: string, scene: typeof SceneBase) {
        if (this.context.scenes.has(key) === false) {
            this.context.scenes.set(key, scene);
        }
    }

    private validateConfig(config: GameConfig) {
        if (!config.timerLimit) {
            throw new Error("The timer limit is undefined, specify the timer limit in the configuration");
        }
        else if (config.timerLimit && config.timerLimit < 10) {
            throw new Error("The value of the timer limit should be higher than 10 seconds"); 
        }
    }
}