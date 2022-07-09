export class Bug extends Phaser.GameObjects.Image {
    private _config: BugConfig;
    private _flipTimeline: Phaser.Tweens.Timeline;
    private _isRevealed: boolean;

    constructor(scene: Phaser.Scene, config: BugConfig) {
        config = getValidConfig(config);
        super(scene, config.x, config.y, config.hiddenStateTexture);

        this._config = config;
        this._isRevealed = false;

        this.setInteractive()
            .on("pointerup", () => {
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

    public setCallback(callback: () => void): Bug {
        this._config.callback = callback;
        return this;
    }

    public setDisplayHeight(height: number): Bug {
        const width = getFitWidth(height, this.width, this.height);
        this.setDisplaySize(width, height);
        return this;
    }

    public setActiveState(): Bug {
        this.setTexture(this._config.activeStateTexture);
        return this;
    }

    public setHiddenState(): Bug {
        this.setTexture(this._config.hiddenStateTexture);
        return this;
    }

    public setWrongState(): Bug {
        this.setTexture(this._config.wrongStateTexture);
        return this;
    }

    public tweenActiveState(returnToHiddenState = false) {
        this.flipTween(this._config.activeStateTexture, returnToHiddenState);
    }

    public tweenHiddenState() {
        this.flipTween(this._config.hiddenStateTexture);
    }

    public tweenWrongState(returnToHiddenState = false) {
        this.flipTween(this._config.wrongStateTexture, returnToHiddenState);
    }

    private flipTween(stateTexture: string, returnToHiddenState = false) {
        if (this._flipTimeline && this._flipTimeline.isPlaying()) {
            return;
        }

        const orgScaleX = this.scaleX;
        if (returnToHiddenState) {
            this._flipTimeline = this.scene.tweens.timeline({
                targets: this,
                yoyo: false,
                loop: 0,
                tweens: [
                    {
                        ease: "Cubic.easeOut",
                        duration: 250,
                        props: {
                            scaleX: orgScaleX*0.05
                        }
                    },
                    {
                        ease: "Cubic.easeOut",
                        duration: 250,
                        props: {
                            scaleX: orgScaleX
                        },
                        onStart: () => {
                            this.setTexture(stateTexture);
                        }
                    },
                    {
                        ease: "Cubic.easeOut",
                        duration: 250,
                        props: {
                            scaleX: orgScaleX
                        }
                    },
                    {
                        ease: "Cubic.easeOut",
                        duration: 250,
                        props: {
                            scaleX: orgScaleX*0.05
                        }
                    },
                    {
                        ease: "Cubic.easeOut",
                        duration: 250,
                        props: {
                            scaleX: orgScaleX
                        },
                        onStart: () => {
                            this.setTexture(this._config.hiddenStateTexture);
                        }
                    },
                ]
            });
        }
        else {
            this._flipTimeline = this.scene.tweens.timeline({
                targets: this,
                yoyo: false,
                loop: 0,
                tweens: [
                    {
                        ease: "Cubic.easeOut",
                        duration: 250,
                        props: {
                            scaleX: orgScaleX*0.05
                        }
                    },
                    {
                        ease: "Cubic.easeOut",
                        duration: 250,
                        props: {
                            scaleX: orgScaleX
                        },
                        onStart: () => {
                            this.setTexture(stateTexture);
                        }
                    },
                ]
            });
        }
    }
}

export type BugConfig = {
    x: number;
    y: number;
    revealDuration?: number;
    activeStateTexture?: string;
    wrongStateTexture?: string;
    hiddenStateTexture?: string;
    callback?: () => void;
}

function getValidConfig(config: BugConfig): BugConfig {
    if (!config.activeStateTexture) {
        config.activeStateTexture = "bug_active";
    }
    if (!config.hiddenStateTexture) {
        config.hiddenStateTexture = "bug_hidden";
    }
    if (!config.wrongStateTexture) {
        config.wrongStateTexture = "bug_wrong";
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