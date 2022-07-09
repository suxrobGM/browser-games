import { BootstrapperBase } from "@core/bootstrapperBase";
import { Level } from "@core/level";
import { ScenesList } from "./scenesList";
import { Game } from "./scenes/game";
import { MainMenu } from "./scenes/mainMenu";
import { Tutorial } from "./scenes/tutorial";
import { Config } from "./config";

export default class Bootstrapper extends BootstrapperBase {
    constructor() {
        super(Config, Bootstrapper);
    }

    public getStartupScene(): string {
        return ScenesList.MainMenu;
    }

    protected async registerLevels() {
        const levels = await Level.loadLevelsAsync(`${this.context.assetsPath}/levels.json`);

        for (const level of levels) {
            this.addLevel(level);
        }
    }

    protected registerScenes(): void {
        this.addScene(ScenesList.Game, Game);
        this.addScene(ScenesList.MainMenu, MainMenu);
        this.addScene(ScenesList.Tutorial, Tutorial);
    }
}