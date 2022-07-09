import "phaser"
import { BootstrapperBase } from "@core/bootstrapperBase";
import { SessionData } from "@core/types";
import { GamesList as games } from "./gamesList";
import { GlobalConfig } from "./config";

export class Launcher extends Phaser.Scene {
    private readonly _game: BootstrapperBase;
    private readonly _sessionData: SessionData;

    constructor(game: BootstrapperBase, sessionData?: SessionData) {
        super("launcher");
        this._game = game;
        this._sessionData = sessionData;
    }

    public init() {
        this.game.registry.set("callbackUrl", GlobalConfig.callbackUrl);
        this.game.registry.set("sessionData", this._sessionData);
    }

    public create() {
        this.addGameScenes(this._game);
        this.scene.start(this._game.getBootstrapper());
    }

    private addGameScenes(game: BootstrapperBase) {
        game.context.scenes.forEach((scene, key) => {
            if (this.scene.getIndex(key) === -1) {
                this.scene.add(key, scene, false);
            }
        });
    }
}

export function initGame(sessionData: SessionData) {
    for (const game of games) {
        if (game.context.config.gameId === sessionData.gameId) {
            GlobalConfig.scene = new Launcher(game, sessionData);
            new Phaser.Game(GlobalConfig);
            return;
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).initGame = initGame;