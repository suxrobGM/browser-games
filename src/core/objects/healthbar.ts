import { SceneBase } from "@core/scenes/sceneBase";
import { Buttons } from "phaser3-rex-plugins/templates/ui/ui-components.js";

export class Healthbar extends Buttons {
    private readonly _config: HealthbarConfig;
    private _healthAmount: number;

    constructor(scene: SceneBase, config: HealthbarConfig) {
        config = getValidConfig(config);
        super(scene, {
            x: config.x,
            y: config.y,
            expand: false,
            space: {
                item: 10
            },
        });

        this._config = config;
        this._healthAmount = config.healthAmount;

        this.addHealthIcons();
        this.on("healthOver", this.healthOverHandler, this);
        this.layout();
    }

    public get health(): number {
        return this._healthAmount;
    }

    public set onHealthOver(callback: () => void) {
        this._config.onHealthOver = callback;
    }

    public killHealth(): number {
        if (this._healthAmount <= 0) {
            return;
        }

        this._healthAmount--;
        for (const child of this.getChildren()) {
            const icon = child as Phaser.GameObjects.Image;
            
            if (icon.visible) {
                this.tweenKillHealth(icon);
                break;
            }
        }

        if (this._healthAmount === 0) {
            this.emit("healthOver");
        }
        return this._healthAmount;
    }

    public reset() {
        this._healthAmount = this._config.healthAmount;

        for (const child of this.getAllChildren()) {
            const icon = child as Phaser.GameObjects.Image;
            icon.setVisible(true);
        }
    }

    public setOrigin(x?: number, y?: number): this {
        super.setOrigin(x, y);
        this.layout();
        return this;
    }

    private healthOverHandler() {
        if (this._config.onHealthOver) {
            this._config.onHealthOver();
        }
    }

    private tweenKillHealth(icon: Phaser.GameObjects.Image) {
        this.scene.tweens.add({
            targets: icon,
            yoyo: false,
            loop: 0,
            duration: 1000,
            ease: "Linear",
            props: {
                alpha: 0
            },
            onComplete: () => {
                icon.setVisible(false);
            }
        })
    }

    private addHealthIcons() {
        for (let i = 0; i < this._config.healthAmount; i++) {
            const icon = new Phaser.GameObjects.Image(this.scene, 0, 0, "heart");
            icon.setOrigin(0);
            icon.setDisplaySize(32, 28);
            this.scene.add.existing(icon);
            this.addButton(icon);
        }
    }
}

export type HealthbarConfig = {
    x: number; 
    y: number;
    healthAmount?: number;
    texture?: string;
    onHealthOver?: () => void;
}

function getValidConfig(config: HealthbarConfig): HealthbarConfig {
    if (!config.texture) {
        config.texture = "heart";
    }
    if (!config.healthAmount) {
        config.healthAmount = 3;
    }

    return config;
}