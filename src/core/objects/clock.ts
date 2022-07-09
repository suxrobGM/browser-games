import { SceneBase } from "@core/scenes/sceneBase";
import { Label, RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";

export class Clock extends Label {
    private readonly _config: TimerConfig;
    private _icon: Phaser.GameObjects.Image;
    private _timerText: Phaser.GameObjects.Text;
    private _timerValue: number;
    private _timerEvent: Phaser.Time.TimerEvent;

    constructor(scene: SceneBase, config: TimerConfig) {
        config = getValidConfig(config);

        const icon = new Phaser.GameObjects.Image(scene, 0, 0, config.iconTexture);
        const timerText = new Phaser.GameObjects.Text(scene, 0, 0, Clock.getFormatedTimerValue(config.startTime), config.textStyle);
        const bg = new RoundRectangle(scene, 0, 0, 0, 0, 10, config.backgroundColor, config.backgroundAlpha);
        icon.setDisplaySize(config.iconWidth, config.iconHeight);

        super(scene, {
            x: config.x,
            y: config.y,
            text: timerText,
            icon: icon,
            background: bg,
            align: "left",
            space: {
                icon: 10,
                left: 10,
                right: 5,
                top: 5,
                bottom: 5
            }
        });

        this._config = config;
        this._icon = icon;
        this._timerText = timerText;
        this._timerValue = config.startTime;
        
        this.scene.add.existing(bg);
        this.scene.add.existing(this._icon);
        this.scene.add.existing(this._timerText);
        this.layout();

        if (config.startImmediately) {
            this.start();
        }
    }

    public get paused(): boolean {
        if (this._timerEvent) {
            return this._timerEvent.paused;
        }
        
        return false;
    }

    public set paused(value: boolean) {
        if (this._timerEvent) {
            this._timerEvent.paused = value;
        }
    }

    public set onTickChanged(callback: TickChangedCallback) {
        this._config.onTickChanged = callback;
    }
    
    public set onTimerCompleted(callback: TimerCompletedCallback) {
        this._config.onTimerCompleted = callback;
    }

    public start() {
        this._timerEvent = this.scene.time.addEvent({delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true, });
    }

    public pause() {
        if (this.paused) {
            return;
        }

        this.paused = true;
    }

    public resume() {
        if (!this.paused) {
            return;
        }

        this.paused = false;
    }

    public reset() {
        if (this._timerEvent) {
            this._timerEvent.destroy();
            this._timerValue = this._config.startTime;
        }
    }

    public setOrigin(x?: number, y?: number): this {
        super.setOrigin(x, y);
        this.layout();
        return this;
    }

    public setIcon(iconTexture: string, width = 38, height = 38): Clock {
        this._icon?.destroy();
        this._icon = new Phaser.GameObjects.Image(this.scene, this.x, this.y, iconTexture);
        this._icon.setDisplaySize(width, height)
        this._icon.setOrigin(0);
        this.scene.add.existing(this._icon);
        this.layout();
        return this;
    }

    public setTextStyle(style: Phaser.Types.GameObjects.Text.TextStyle): Clock {
        this._timerText.setStyle(style);
        return this;
    }

    public getStartTimeSeconds(): number {
        return this._config.startTime;
    }

    public getIconBounds(): Phaser.Geom.Rectangle {
        return this._icon.getBounds();
    }

    private updateTimer() {
        if (this._timerValue > 0) {
            this._timerValue--; 
        }
        else {
            if (this._config.onTimerCompleted) {
                this._config.onTimerCompleted();
            }
            
            this.reset();
        }
        
        this._timerText.setText(Clock.getFormatedTimerValue(this._timerValue));

        if (this._config.onTickChanged) {
            this._config.onTickChanged(this._timerValue);
        }
    }

    private static getFormatedTimerValue(timerValue: number): string {
        return new Date(timerValue * 1000).toISOString().substring(14, 19);
    }
}

export type TimerConfig = {
    x: number;
    y: number;
    startTime?: number;
    startImmediately?: boolean;
    iconTexture?: string;
    iconWidth?: number;
    iconHeight?: number;
    backgroundColor?: number;
    backgroundAlpha?: number;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    onTickChanged?: TickChangedCallback;
    onTimerCompleted?: TimerCompletedCallback;
}

type TickChangedCallback = (tick: number) => void;
type TimerCompletedCallback = () => void;

function getValidConfig(config: TimerConfig): TimerConfig {
    const dp = window.devicePixelRatio;

    if (!config.startTime) {
        config.startTime = 45;
    }
    if (!config.startImmediately) {
        config.startImmediately = false;
    }
    if (!config.iconWidth) {
        config.iconWidth = dp >= 2 ? 50 : 38;
    }
    if (!config.iconHeight) {
        config.iconHeight = dp >= 2 ? 50 : 38;
    }
    if (!config.iconTexture) {
        config.iconTexture = "timer_icon";
    }
    if (!config.backgroundColor) {
        config.backgroundColor = 0x11246b;
    }
    if (!config.backgroundAlpha) {
        config.backgroundAlpha = 0.5;
    }
    if (!config.textStyle) {
        const fs = dp >= 2 ? 3 : 2;
        config.textStyle = {
            fontSize: `${fs}rem`
        };
    }

    return config;
}
