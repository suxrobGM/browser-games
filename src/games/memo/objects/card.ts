import { PerspectiveCard } from "phaser3-rex-plugins/plugins/perspectiveimage.js";

export class Card extends PerspectiveCard {
    private readonly _config: CardConfig;
    private _isRevealed: boolean;

    constructor(scene: Phaser.Scene, config: CardConfig) {
        config = getValidConfig(config);
        super(scene, {
            x: config.x,
            y: config.y,
            front: {
                key: config.frontTexture
            },
            back: {
                key: config.backTexture
            },
            face: 0,
            orientation: 0,
            flip: {
                duration: 500
            }
        });

        this._config = config;
        this._isRevealed = false;

        this.setInteractive()
            .on("pointerup", () => {
                if (this.isRevealed) {
                    return;
                }

                this.flip.flip();
                if (this._config.callback) {
                    this._config.callback();
                }
            });
    }

    public get isRevealed(): boolean {
        return this._isRevealed;
    }
    
    public set isRevealed(value: boolean) {
        this._isRevealed = value;
    }

    public getFrontTextureKey(): string {
        return this.frontFace.texture.key;
    }

    public flipBack() {
        // if opened front face then flip to back face
        if (this.face === 0) { 
            this.flip.flip();
        }
    }

    public flipOpen() {
        if (this.face === 1) {
            this.flip.flip();
        }
    }

    public setBackFace(): Card {
        this.face = 1;
        return this;
    }
    
    public setFrontFace(): Card {
        this.face = 0;
        return this;
    }

    public setCallback(callback: () => void): Card {
        this._config.callback = callback;
        return this;
    }

    public setDisplayHeight(height: number): Card {
        const width = getFitWidth(height, this.width, this.height);
        this.setDisplaySize(width, height);
        return this;
    }
}

export type CardConfig = {
    x: number;
    y: number;
    revealDuration?: number;
    frontTexture?: string;
    backTexture?: string;
    callback?: () => void;
}

function getValidConfig(config: CardConfig): CardConfig {
    if (!config.frontTexture) {
        config.frontTexture = "card_1";
    }
    if (!config.backTexture) {
        config.backTexture = "card_back";
    }
    if (!config.revealDuration) {
        config.revealDuration = 1000;
    }
    return config;
}

function getFitWidth(destHeight: number, srcWidth: number, srcHeight: number): number {
    const ratio = destHeight / srcHeight;
    return srcWidth * ratio;
}