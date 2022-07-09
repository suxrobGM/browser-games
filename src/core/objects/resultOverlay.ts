import { SceneBase } from "@core/scenes/sceneBase";
import { ThreadUtils } from "@core/utils";

export class ResultOverlay extends Phaser.GameObjects.Container {
    private _correctResultIcon: Phaser.GameObjects.Image;
    private _wrongResultIcon: Phaser.GameObjects.Image;
    private _overlay: Phaser.GameObjects.Rectangle;

    constructor(scene: SceneBase) {
        const width = scene.game.canvas.width;
        const height = scene.game.canvas.height;
        super(scene, 0, 0);

        this._correctResultIcon = new Phaser.GameObjects.Image(scene, width/2, height/2, "correct_choice");
        this._wrongResultIcon = new Phaser.GameObjects.Image(scene, width/2, height/2, "wrong_choice");
        this._overlay = new Phaser.GameObjects.Rectangle(scene, 0, 0, width, height, 0x344996, 0.5);

        this._correctResultIcon.setOrigin(0.5);
        this._correctResultIcon.setDisplaySize(150, 150);
        this._correctResultIcon.setDepth(2);

        this._wrongResultIcon.setOrigin(0.5);
        this._wrongResultIcon.setDisplaySize(150, 150);
        this._wrongResultIcon.setDepth(2);
        
        this._overlay.setOrigin(0);
        this._overlay.setDepth(1);

        this.setVisible(false);
        this.setDepth(999);
        this.add(this._overlay);
        this.add(this._correctResultIcon);
        this.add(this._wrongResultIcon);
    }

    public setPosition(x?: number, y?: number, z?: number, w?: number): this {
        super.setPosition(x, y, z, w);
        const width = this.scene.game.canvas.width;
        const height = this.scene.game.canvas.height;
        const localPoint = this.getLocalPoint(0, 0);

        this._overlay?.setSize(width, height);
        this._overlay?.setPosition(localPoint.x, localPoint.y);
        this._correctResultIcon?.setPosition(0, 0);
        this._wrongResultIcon?.setPosition(0, 0);
        return this;
    }

    public async showCorrectResultAsync() {
        this._wrongResultIcon.setVisible(false);
        this._correctResultIcon.setVisible(true);
        this.setVisible(true);
        this.scene.input.enabled = false;
        await ThreadUtils.sleep(1000);
        this.close();
        this.scene.input.enabled = true;
    }

    public async showWrongResultAsync() {
        this._correctResultIcon.setVisible(false);
        this._wrongResultIcon.setVisible(true);
        this.scene.input.enabled = false;
        this.setVisible(true);
        await ThreadUtils.sleep(1000);
        this.close();
        this.scene.input.enabled = true;
    }

    private close() {
        this._wrongResultIcon.setVisible(false);
        this._correctResultIcon.setVisible(false);
        this.setVisible(false);
    }
}