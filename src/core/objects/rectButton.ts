import { SceneBase } from "@core/scenes/sceneBase";
import { RoundRectangle, Label } from "phaser3-rex-plugins/templates/ui/ui-components.js";

export class RectButton extends Label {
    private readonly _config: RectButtonConfig;
    private _rect: RoundRectangle;

    constructor(scene: SceneBase, config?: RectButtonConfig) {
        config = getValidConfig(config);
        const labelText = new Phaser.GameObjects.Text(scene, 0, 0, config.text, config.textStyle);
        const rect = new RoundRectangle(scene, config.x, config.y, config.width, config.height, config.radius, config.fillColor, config.fillAlpha);

        super(scene, {
            x: config.x, 
            y: config.y, 
            width: config.width, 
            height: 
            config.height, 
            text: labelText, 
            background: rect, 
            align: "center"
        });

        this._config = config;
        this._rect = rect;
        scene.add.existing(this._rect);
        scene.add.existing(labelText);

        this.layout();
        this.setInteractive()
            .on("pointerover", () => this.enterButtonHoverState())
            .on("pointerout", () => this.enterButtonRestState())
            .on("pointerup", () => {
                this.enterButtonHoverState();

                if (this._config.onClick) {
                    this._config.onClick();
                }
            });
    }

    public get radius(): number {
        return this._rect.radius;
    }

    public set radius(value: number) {
        this._rect.setRadius(value);
    }

    public setBackgroundFillStyle(color: number, alpha: number): RectButton {
        this._rect.setFillStyle(color, alpha);
        return this;
    }

    public setOrigin(x?: number, y?: number): this {
        super.setOrigin(x, y);
        this.layout();
        return this;
    }

    public setCallback(callback: RectButtonCallback): RectButton {
        this._config.onClick = callback;
        return this;
    }

    private enterButtonHoverState() {
        this._rect.setStrokeStyle(1, 0xffffff, 1);
    }
    
    private enterButtonRestState() {
        this._rect.setStrokeStyle(1, 0xffffff, 0);
    }
}

function getValidConfig(config: RectButtonConfig): RectButtonConfig {
    const dp = window.devicePixelRatio;

    if (!config.fillColor) {
        config.fillColor = 0xffffff;
    }
    if (!config.fillAlpha) {
        config.fillAlpha = 1;
    }
    if (!config.radius) {
        config.radius = 16;
    }
    if (!config.text) {
        config.text = "";
    }
    if (!config.textStyle) {
        const fs = 2 * dp;
        config.textStyle = {
            fontSize: `${fs}rem`,
            color: "#000000"
        };
    }

    return config;
}

export type RectButtonConfig = {
    x: number; 
    y: number;
    width: number;
    height: number;
    fillColor?: number;
    fillAlpha?: number;
    radius?: number;
    text?: string;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    onClick?: RectButtonCallback;
}

export type RectButtonCallback = () => void;