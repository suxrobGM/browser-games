import { Buttons, RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import { LetterButton } from "./letterButton";

export class Choice extends Buttons {
    private _bgRect: RoundRectangle;
    private _letterButtons: LetterButton[];
    private _outline: Phaser.GameObjects.Graphics;
    private _config: ChoiceConfig;

    constructor(scene: Phaser.Scene, config: ChoiceConfig) {
        super(scene, {
            x: config.x,
            y: config.y,
            height: config.height,
            orientation: 0,
            buttons: [],
            type: undefined,
            space: {
               item: 20,
               top: 5,
               left: 15,
               right: 15,
               bottom: 5
            },
        });

        this._letterButtons = [];
        this._config = config;
        
        for (const letter of config.text) {
            const letterButtton = new LetterButton(scene, {x: 0, y: 0, width: config.height, letter: letter});
            letterButtton.setDepth(1);

            letterButtton.setInteractive()
                .on("pointerover", () => this.enterButtonHoverState())
                .on("pointerout", () => this.enterButtonRestState())
                .on("pointerup", () => {
                    this.enterButtonHoverState();

                    if (config.callback) {
                        config.callback();
                    }
                });

            this.addButton(letterButtton);
            this._letterButtons.push(letterButtton);
        }

        this._outline = scene.add.graphics().setDepth(2);
        this._bgRect = new RoundRectangle(scene, 0, 0, 0, 0, 32, 0x344996, 1);
        this._bgRect.setStrokeStyle(10, 0x15255e, 1);
        this.addBackground(this._bgRect);
        this.setOrigin(0);
        this.layout();
        
        this.setInteractive()
            .on("pointerover", () => this.enterButtonHoverState())
            .on("pointerout", () => this.enterButtonRestState())
            .on("pointerup", () => {
                this.enterButtonHoverState();

                if (config.callback) {
                    config.callback();
                }
            });

        scene.add.existing(this._bgRect);
        scene.add.existing(this);
    }

    public get text(): string {
        return this._config.text;
    }

    public setCallback(callback: () => void): Choice {
        this._config.callback = callback;
        return this;
    }

    public clearOutline() {
        this._outline.clear();
    }

    private enterButtonHoverState() {
        const bounds = this.getBounds();
        this._outline.lineStyle(2, 0xffffff);
        this._outline.strokeRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, this._bgRect.radius);
    }
    
    private enterButtonRestState() {
        this._outline.clear();
    }
}

export type ChoiceConfig = {
    x: number;
    y: number;
    text: string;
    height: number;
    callback?: () => void;
}
