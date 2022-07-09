import { MainMenuBase } from "@core/scenes/mainMenuBase";
import { ScenesList } from "../scenesList";

export class MainMenu extends MainMenuBase {
    protected startGame() {
        this.scene.start(ScenesList.Game);
    }

    protected startTutorial() {
        this.scene.start(ScenesList.Tutorial);
    }
}