import { SceneBase } from "@core/scenes/sceneBase";
import { Label, RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";

export class RectLabel extends Label {
    private readonly _config: RectLabelConfig;
    private _outline: Phaser.GameObjects.Graphics;
    private _textObject: Phaser.GameObjects.Text;
    private _background: RoundRectangle;

    constructor(scene: SceneBase, config: RectLabelConfig) {
        config = getValidConfig(config);

        const text = new Phaser.GameObjects.Text(scene, 0, 0, config.text, config.textStyle);
        const background = new RoundRectangle(scene, 0, 0, 0, 0, config.radius, config.backgroundColor, config.backgroundAlpha);

        super(scene, {
            x: config.x,
            y: config.y,
            background: background,
            text: text,
            align: "center",
            expandTextWidth: true,
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });

        this._config = config;
        this._outline = scene.add.graphics().setDepth(1);
        this._background = background;
        this._textObject = text;
        
        this.setInteractive()
            .on("pointerover", () => this.enterButtonHoverState())
            .on("pointerout", () => this.enterButtonRestState())
            .on("pointerup", () => {
                this.enterButtonHoverState();

                if (this._config.callback) {
                    this._config.callback();
                }
            });

        this._textObject.setOrigin(0.5);
        this.scene.add.existing(background);
        this.scene.add.existing(text);
        this.layout();
    }

    public get textObject(): Phaser.GameObjects.Text {
        return this._textObject;
    }

    public setCallback(callback: () => void) {
        this._config.callback = callback;
    }

    public setText(text: string): this {
        super.setText(text);
        
        // const bounds = this._textObject.getBounds();
        // this._background.resize(bounds.width + 20, bounds.height + 20);
        // this._background.setPosition(bounds.centerX, bounds.centerY);
        // this._background.setOrigin(0.5);
        return this;
    }

    public setOrigin(x?: number, y?: number): this {
        super.setOrigin(x, y);
        this.layout();
        return this;
    }

    private enterButtonHoverState() {
        if (!this._config.enableOutline) {
            return;
        }

        const bounds = this._background.getBounds();
        this._outline.lineStyle(2, 0xffffff);
        this._outline.strokeRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, this._config.radius);
    }
    
    private enterButtonRestState() {
        if (!this._config.enableOutline) {
            return;
        }

        this._outline.clear();
    }
}

export type RectLabelConfig = {
    x: number;
    y: number;
    text: string;
    backgroundColor?: number;
    backgroundAlpha?: number;
    radius?: number;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    enableOutline?: boolean;
    callback?: () => void;
}

function getValidConfig(config: RectLabelConfig): RectLabelConfig {
    const dp = window.devicePixelRatio;

    if (!config.backgroundColor) {
        config.backgroundColor = 0x11246b;
    }
    if (!config.backgroundAlpha) {
        config.backgroundAlpha = 0.5;
    }
    if (!config.radius) {
        config.radius = 10;
    }
    if (!config.enableOutline) {
        config.enableOutline = false;
    }
    if (!config.textStyle) {
        const fs = dp >= 2 ? 3 : 2;
        config.textStyle = {
            fontSize: `${fs}rem`
        };
    }

    return config;
}