import ScaleDownDestroy from "phaser3-rex-plugins/plugins/scale-down-destroy.js";
import { Label, RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";

export class ColoredWord extends Label {
    private readonly _config: ColoredWordConfig;
    private readonly _textElement: Phaser.GameObjects.Text;
    private readonly _visibleTimeline: Phaser.Tweens.Timeline;
    private _visibleTimelineCallback: () => void;
    
    constructor(scene: Phaser.Scene, config: ColoredWordConfig) {
        config = getValidConfig(config);
        const textElement = new Phaser.GameObjects.Text(scene, 0, 0, config.data.text, config.style);
        const background = new RoundRectangle(scene, 0, 0, 0, 0, 10, 0x0, 0.5);

        super(scene, {
            x: config.x,
            y: config.y,
            text: textElement,
            background: background,
            align: "center",
            space: {
                top: 10,
                left: 10,
                right: 10,
                bottom: 10
            }
        });

        this._config = config;
        this._textElement = textElement;
        this._visibleTimeline = this.createVisibleTimeline();

        this.setInteractive()
            .on("pointerup", () => {
                if (this._config.onClick) {
                    this._config.onClick();
                }
            });

        textElement.setDepth(2);
        background.setDepth(1);
        scene.add.existing(textElement);
        scene.add.existing(background);
        this.layout();
    }

    public get originalColor(): string {
        return this._config.data.color;
    }

    public get actualColor(): string {
        return this._textElement.style.color;
    }

    public setOnClick(callback: () => void): ColoredWord {
        this._config.onClick = callback;
        return this;
    }

    public tweenVisible(callback?: () => void) {
        this._visibleTimelineCallback = callback;
        this._visibleTimeline.play();
    }

    public tweenDestroy() {
        this._visibleTimeline.pause();
        ScaleDownDestroy(this, 500);
    }

    public destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
    }

    private createVisibleTimeline(): Phaser.Tweens.Timeline {
        const orgScale = this.scale;

        const timeline = this.scene.tweens.timeline({
            targets: this,
            yoyo: false,
            loop: 0,
            paused: true,
            ease: "Cubic.easeIn",
            tweens: [
                {
                    duration: 1000,
                    props: {
                        scale: orgScale,
                        alpha: 1.0
                    },
                    onStart: () => {
                        this.setVisible(true);
                        this.setOrigin(0.5);
                        this.setScale(0);
                        this.setAlpha(0);
                    },
                    onComplete: () => {
                        this.setScale(orgScale);
                    }
                },
                {
                    duration: this._config.visibilityDuration,
                    props: {
                        scale: orgScale
                    }
                },
                {
                    duration: 1000,
                    props: {
                        scale: orgScale*1.5,
                        alpha: 0
                    },
                    onComplete: () => {
                        this.setVisible(false);
                        this.setScale(orgScale);
                        this.setOrigin(0);
                        this.setAlpha(1.0);
                    }
                },
            ],
            onComplete: () => {
                if (this._visibleTimelineCallback) {
                    this._visibleTimelineCallback();
                }
            }
        });

        return timeline;
    }
}

export type ColoredWordConfig = {
    x: number;
    y: number;
    data: ColoredWordData;
    visibilityDuration?: number;
    style?: Phaser.Types.GameObjects.Text.TextStyle;
    onClick?: () => void;
}

export type ColoredWordData = {
    text: string;
    color?: string;
}

function getValidConfig(config: ColoredWordConfig): ColoredWordConfig {
    if (!config.data.color) {
        config.data.color = "#ffffff";
    }
    if (!config.visibilityDuration) {
        config.visibilityDuration = 2000;
    }
    if (!config.style) {
        const fontSize = 2 * window.devicePixelRatio;
        config.style = {
            fontSize: `${fontSize}rem`,
        };
    }
    config.data.color = config.data.color.toLowerCase();
    config.data.text = config.data.text.toUpperCase();
    return config;
}