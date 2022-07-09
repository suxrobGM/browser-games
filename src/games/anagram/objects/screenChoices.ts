import { Utils } from "phaser";
import ContainerLite from "phaser3-rex-plugins/plugins/containerlite.js";
import { Buttons } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import { Anagram } from "../anagram";
import { Choice } from "./choice";
import { Screen } from "./screen";

export class ScreenChoices extends ContainerLite {
    private _screen: Screen;
    private _choices: Choice[];
    private _choicesButtons: Buttons;
    private _config: ScreenChoicesConfig;

    constructor(scene: Phaser.Scene, config: ScreenChoicesConfig) {
        config = getValidConfig(config);
        super(scene, config.x, config.y, config.height);

        this._config = config;
        this._screen = new Screen(scene, {x: config.x, y: config.y, height: config.height/2, text: config.text});
        this._choicesButtons = new Buttons(this.scene, {
            x: this._screen.getBounds().centerX,
            y: this._screen.getBounds().bottom + 20,
            orientation: 1,
            space: {
                item: 20
            }, 
        });
        this._choices = [];
        
        this._choicesButtons.setOrigin(0.5, 0);
        this._choicesButtons.layout();
        this.add(this._screen);
        this.add(this._choicesButtons);
        this.addChoices();
        this.setY();
    }

    public get choices(): Choice[] {
        return this._choices;
    }

    public get text(): string {
        return this._screen.text;
    }

    public set text(value: string) {
        this._screen.setText(value);
        this.removeChoices();
        this.addChoices();
    }

    public setText(value: string): ScreenChoices {
        this.text = value;
        return this;
    }

    public tweenStart(callback?: () => void) {
        const canvasHeight = this.scene.game.canvas.height;
        const initY = -(2*this.getBounds().height + canvasHeight);
        
        this.scene.add.tween({
            targets: this,
            yoyo: false,
            loop: 0,
            duration: 500,
            ease: "Cubic.easeIn",
            props: {
                y: this._config.y
            },
            onStart: () => {
                this.setY(initY);
                this.setVisible(true);
            },
            onComplete: () => {
                this.setY(this._config.y);

                if (callback) {
                    callback();
                }
            }
        });
    }

    public tweenEnd(callback?: () => void) {
        const canvasHeight = this.scene.game.canvas.height;
        const initY = -(2*this.getBounds().height + canvasHeight);
        const endY = 2*this.getBounds().height + canvasHeight;

        this.scene.add.tween({
            targets: this,
            yoyo: false,
            loop: 0,
            duration: 500,
            ease: "Cubic.easeIn",
            props: {
                y: endY
            },
            onStart: () => {
                this._choices.forEach(choice => {
                    choice.clearOutline();
                });

                this.setVisible(true);
            },
            onComplete: () => {
                this.setVisible(false);
                this.setY(initY);
                
                if (callback) {
                    callback();
                }
            }
        });
    }

    private addChoices() {
        const choicesCount = this._config.choicesCount;
        const dp = window.devicePixelRatio;
        const height = dp >= 2 ? 90 : 50;

        for (let i = 1; i <= choicesCount; i++) {
            const replaceLastChar = i === choicesCount ? false : true;
            const shuffledWord = Anagram.shuffle(this._screen.text, replaceLastChar);
            const wordsChoice = new Choice(this.scene, {x: 0, y: 0, height: height, text: shuffledWord});
            this._choices.push(wordsChoice);
        }

        Utils.Array.Shuffle(this._choices)
        this._choices.forEach(choiceButton => {
            this._choicesButtons.addButton(choiceButton);
        });
        
        this._choicesButtons.layout();
    }

    private removeChoices() {
        this._choices = [];
        this._choicesButtons.removeAll(true);
        this._choicesButtons.layout();
    }
}

export type ScreenChoicesConfig = {
    x: number;
    y: number;
    width?: number;
    height: number;
    text: string;
    choicesCount?: number;
}

function getValidConfig(config: ScreenChoicesConfig): ScreenChoicesConfig {
    if (!config.choicesCount) {
        config.choicesCount = 4;
    }

    return config;
}