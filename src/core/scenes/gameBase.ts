/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { GameEvents } from "@core/events";
import { SceneBase } from "@core/scenes/sceneBase";
import { Clock } from "@core/objects/clock";
import { FullscreenButton } from "@core/objects/fullscreenButton";
import { Level } from "@core/level";
import { RectLabel } from "@core/objects/rectLabel";
import { Healthbar } from "@core/objects/healthbar";
import { ResultOverlay } from "@core/objects/resultOverlay";
import CircularProgressCanvas from "phaser3-rex-plugins/plugins/circularprogresscanvas.js";
import { PageUtils } from "@core/utils";

export abstract class GameBase extends SceneBase {
    private _currentLevelLabel: RectLabel;
    private _currentLevel: Level;
    private _clock: Clock;
    private _backButton: RectLabel;
    private _fullscreenButton: FullscreenButton;
    private _healthbar: Healthbar;
    private _starterCountdown: RectLabel;
    private _score: number;
    private _scoreLabel: RectLabel;
    private _roundScore: number;
    private _centerTextLabel: RectLabel;
    private _resultOverlay: ResultOverlay;
    private _backgroundTile: Phaser.GameObjects.TileSprite;

    constructor() {
        super(null);
        this._score = 0;
        this._roundScore = 0;
    }

    //#region Properties

    public get clock(): Clock {
        return this._clock;
    }

    public get healthbar(): Healthbar {
        return this._healthbar;
    }

    public get currentLevel(): Level {
        return this._currentLevel;
    }

    public get score(): number {
        return this._score;
    }

    public set score(value: number) {
        this._score = value;
        try {
            this._scoreLabel?.setText(value.toString());
        } catch (error) {
            // ignore
        }
    }

    public get roundScore(): number {
        return this._roundScore;
    }

    public set roundScore(value: number) {
        this._roundScore = value;
    }

    public get scoreLabel(): RectLabel {
        return this._scoreLabel;
    }

    public get resultOverlay(): ResultOverlay {
        return this._resultOverlay;
    }

    //#endregion


    //#region Lifecycle methods

    protected onInit(data?: any): void {
        if (this.context.levels.length < 1) {
            throw new Error("Not defined any levels, add at least one game's level");
        }

        
        this._currentLevel = this.context.getCurrentLevel();
        this.roundScore = this._currentLevel.awardPoints;
        this.registerEvents();
    }

    protected onPreload(): void {
        const assets = "assets/core";
        const height = this.game.canvas.height;
        const width = this.game.canvas.width;

        const circularProgress = new CircularProgressCanvas(this, width/2, height/2, 75, 0xffffff, 0, {
            trackColor: 0x260e04,
            barColor: 0x7b5e57,
            centerColor: 0x4e342e,
            textStrokeColor: "red",
            textStrokeThickness: 3,
            textSize: "50px",
            textStyle: "bold",
            textFormatCallback: value => Math.floor(value * 100).toString(),
            valuechangeCallback: () => {}
        });

        circularProgress.setVisible(false);
        circularProgress.setOrigin(0.5);
        this.add.existing(circularProgress);

        this.load.on("start", () => circularProgress.setVisible(true));
        this.load.on("progress", (value: number) => circularProgress.value = value);
        this.load.on("complete", () => circularProgress.setVisible(false));

        this.load.spritesheet("timer_icon", `${assets}/timer_32.png`, {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet("fullscreen", `${assets}/fullscreen.png`, {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet("background", `${assets}/background.png`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet("heart", `${assets}/heart.png`, {frameWidth: 64, frameHeight: 56});
        this.load.spritesheet("correct_choice", `${assets}/correct_choice.png`, {frameWidth: 640, frameHeight: 640});
        this.load.spritesheet("wrong_choice", `${assets}/wrong_choice.png`, {frameWidth: 641, frameHeight: 640});
    }

    protected onCreate() {
        const height = this.game.canvas.height;
        const width = this.game.canvas.width;
        const dp = window.devicePixelRatio;
        const lgFont = 3 * dp;

        this._clock = new Clock(this, {x: 20, y: 30, startTime: this.context.config.timerLimit});
        this._currentLevelLabel = new RectLabel(this, {x: width - 20, y: 30, text: `Level: ${this.currentLevel.value}`});
        this._scoreLabel =  new RectLabel(this, {x: width/2, y: 30, text: "12345" });
        this._backButton = new RectLabel(this, {x: 20, y: height - 20, text: "Back", enableOutline: true, callback: () => this.backToMenu()});
        this._fullscreenButton = new FullscreenButton(this, {x: width - 20, y: height - 20, texture: "fullscreen"});
        this._centerTextLabel = new RectLabel(this, {x: width/2, y: (height/2) - 100, text: "START", textStyle: {fontSize: `${lgFont}rem`, fontStyle: "bold", color: "#0f0"}});
        this._starterCountdown = new RectLabel(this, {x: width/2, y: (height/2) - 100, text: "GO!", textStyle: {fontSize: `${lgFont}rem`}});
        this._backgroundTile = new Phaser.GameObjects.TileSprite(this, width/2, height/2, width, height, "background");
        this._resultOverlay = new ResultOverlay(this);

        this._clock.setVisible(false);
        this._currentLevelLabel.setVisible(false);
        this._backButton.setVisible(false);
        this._centerTextLabel.setVisible(false);
        this._scoreLabel.setVisible(false);
        this._fullscreenButton.setVisible(false);
        this._clock.setOrigin(0);
        this._currentLevelLabel.setOrigin(1, 0);
        this._scoreLabel.setOrigin(0.5, 0);
        this._backButton.setOrigin(0, 1);
        this._fullscreenButton.setOrigin(1, 1);
        this._starterCountdown.setOrigin(0.5);
        this._backgroundTile.setOrigin(0.5);
        this._centerTextLabel.setOrigin(0.5);
        this._centerTextLabel.setDepth(999);
        this._backgroundTile.setDepth(-1);
        this._scoreLabel.setText(this.score.toString());

        if (PageUtils.isIframe() || !PageUtils.isMobile()) {
            this._fullscreenButton.setVisible(true);
        }

        this._healthbar = new Healthbar(this, {x: width - 20, y: this._currentLevelLabel.bottom + 10, healthAmount: 3});
        this._healthbar.setVisible(false);
        this._healthbar.setOrigin(1, 0);

        this.add.existing(this._clock);
        this.add.existing(this._backButton);
        this.add.existing(this._centerTextLabel);
        this.add.existing(this._currentLevelLabel);
        this.add.existing(this._starterCountdown);
        this.add.existing(this._scoreLabel);
        this.add.existing(this._fullscreenButton);
        this.add.existing(this._healthbar);
        this.add.existing(this._resultOverlay);
        this.add.existing(this._backgroundTile);
        this.clock.onTickChanged = () => this.handleTimer();

        this.tweenStarterCountdown(() => {
            this.visibleHud();
            this.onBegin();
        });
    }

    protected onBegin(): void {}

    protected onResize(): void {
        const height = this.game.canvas.height;
        const width = this.game.canvas.width;

        this._clock?.setPosition(20, 30);
        this._currentLevelLabel?.setPosition(width - 20, 30);
        this._scoreLabel?.setPosition(width/2, 30);
        this._healthbar?.setPosition(width - 20, this._currentLevelLabel.bottom + 10);
        this._backButton?.setPosition(20, height - 20);
        this._fullscreenButton?.setPosition(width - 20, height - 20);
        this._centerTextLabel?.setPosition(width/2, height/2);
        this._starterCountdown?.setPosition(width/2, height/2);
        this._backgroundTile?.setPosition(width/2, height/2);
        this._resultOverlay?.setPosition(width/2, height/2);
        this._backgroundTile?.setSize(width, height);
    }

    protected onDispose(): void {
        this.score = 0; 
        this.clock.reset();
        this.events.removeAllListeners(GameEvents.Complete);
    }

    //#endregion

    
    //#region Public methods

    public addScore(value: number): number {
        const newScore = this.score + value;
        this.score = newScore;
        return newScore;
    }

    public backToMenu() {
        const key = this.context.bootstrapper;
        this.scene.start(key);
    }

    public tweenCenterText(text: string) {
        this._centerTextLabel.setText(text);

        this.tweens.add({
            targets: this._centerTextLabel,
            yoyo: false,
            ease: "Cubic.easeIn",
            duration: 1000,
            props: {
                alpha: 0
            },
            onStart: () => {
                this._centerTextLabel.setVisible(true);
            },
            onComplete: () => {
                this._centerTextLabel.setAlpha(1);
                this._centerTextLabel.setVisible(false);
            }
        });
    }

    public tweenStarterCountdown(callback?: () => void) {
        this.tweens.timeline({
            targets: this._starterCountdown.textObject,
            yoyo: false,
            loop: 0,
            tweens: [
                {
                    ease: "Cubic.easeIn",
                    duration: 1000,
                    props: {
                        alpha: 0.3
                    },
                    onStart: () => {
                        this._starterCountdown.textObject.setAlpha(1.0);
                        this._starterCountdown.setText("3");
                    }
                },
                {
                    ease: "Cubic.easeIn",
                    duration: 1000,
                    props: {
                        alpha: 0.3
                    },
                    onStart: () => {
                        this._starterCountdown.textObject.setAlpha(1.0);
                        this._starterCountdown.setText("2");
                    }
                },
                {
                    ease: "Cubic.easeIn",
                    duration: 1000,
                    props: {
                        alpha: 0.3
                    },
                    onStart: () => {
                        this._starterCountdown.textObject.setAlpha(1.0);
                        this._starterCountdown.setText("1");
                    }
                },
                {
                    ease: "Cubic.easeIn",
                    duration: 1000,
                    props: {
                        alpha: 0.3
                    },
                    onStart: () => {
                        this._starterCountdown.textObject.setAlpha(1.0);
                        this._starterCountdown.setText("GO!");
                    }
                }
            ],
            onStart: () => {
                this._starterCountdown.setVisible(true);
            },
            onComplete: () => {
                this._starterCountdown.setVisible(false);

                if (callback) {
                    callback();
                }
            }
        });
    }

    //#endregion


    //#region Event handlers

    private onCompleteHandler(score: number) { 
        this.clock.reset();
        this.score = 0; 
    } 

    //#endregion
    

    //#region Internal methods

    private registerEvents() {
        this.events.on(GameEvents.Complete, (score: number) => this.onCompleteHandler(score));
    }

    private calcRoundScore() {
        const chargePoints = this.currentLevel.chargePoints;
        
        if ((this.roundScore - chargePoints) > this.currentLevel.minPoints) {
            this.roundScore -= chargePoints;
        }
        else {
            this.roundScore = this.currentLevel.minPoints;
        }
    }

    private handleTimer() {
        this.calcRoundScore();
    }

    private visibleHud() {
        this._clock.setVisible(true);
        this._currentLevelLabel.setVisible(true);
        this._scoreLabel.setVisible(true);
        this._backButton.setVisible(true);
    }

    //#endregion
}
