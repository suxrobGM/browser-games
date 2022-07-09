import { Label } from "phaser3-rex-plugins/templates/ui/ui-components.js";

export class LetterButton extends Label {
    private _letter: string;
    private _config: LetterButtonConfig;

    constructor(scene: Phaser.Scene, config: LetterButtonConfig) {
        if (config.letter.length > 1) {
            config.letter = config.letter[0];
        }

        const bgImage = new Phaser.GameObjects.Image(scene, 0, 0, "letter_button");
        const letterLabel = new Phaser.GameObjects.Text(scene, 0, 0, config.letter.toUpperCase(), {fontSize: "54px", fontStyle: "bold", color: "#262a3a"});
        letterLabel.setOrigin(0.5);
        bgImage.setDisplaySize(config.width, config.width);
        
        super(scene, {
            x: config.x,
            y: config.y,
            text: letterLabel,
            background: bgImage,
            width: config.width,
            height: config.width,
            align: "center"
        });

        this._letter = config.letter;
        this._config = config;
        this.layout();
        scene.add.existing(bgImage);
        scene.add.existing(letterLabel);
        scene.add.existing(this);
    }

    public get letter(): string {
        return this._letter;
    }

    public set letter(value: string) {
        if (value.length > 1) {
            value = value[0];
        }
        this._letter = value.toUpperCase();
    }

    public setLetter(value: string): LetterButton {
        this.letter = value;
        return this;
    }
}

export type LetterButtonConfig = {
    x: number; 
    y: number; 
    width: number; 
    letter: string;
}