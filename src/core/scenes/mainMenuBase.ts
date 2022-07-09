import { RectButton } from "@core/objects/rectButton";
import { SceneBase } from "@core/scenes/sceneBase";
import { PageUtils } from "@core/utils";
import { Dialog, Label, RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";

export abstract class MainMenuBase extends SceneBase {
    private _fullscreenButton: RectButton;
    private _dialog: Dialog;

    protected onPreload(): void {
        const assets = "assets/core";
        this.load.image("results_dialog_body", `${assets}/results_dialog_body.png`);
    }

    protected onCreate() {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const name = this.context.config.displayName;
        const higscore = this.context.sessionData.highscore;
        const level = this.context.sessionData.level;
        
        const dialogWidth = width > 600 ? 400 : 300;
        const dialogHeight = height > 600 ? 600 : 450;
        const dps = window.devicePixelRatio;
        const mdFont = 2 * dps;
        const lgFont = 3 * dps;
        
        this.cameras.main.setBackgroundColor("#000");
        const bg = new RoundRectangle(this, 0, 0, 0, 0, 32, 0x344996, 1);
        const titleLabel = createLabel(this, name, {fontSize: `${lgFont}rem`});
        const levelLabel = createLabel(this, `Level: ${level}`, {fontSize: `${mdFont}rem`});
        const highscoreLabel = createLabel(this, `Highscore: ${higscore}`, {fontSize: `${mdFont}rem`});
        
        const startButton = new RectButton(this, {
            x: 0,
            y: 0,
            width: 120,
            height: 70,
            text: "Start", 
            fillColor: 0x11246b, 
            textStyle: {
                color: "#e5e6e7",
                fontSize: `${mdFont}rem`
            },
            onClick: () => this.startGame()
        });

        const fullscreenButton = new RectButton(this, {
            x: 0,
            y: 0,
            width: 120,
            height: 70,
            text: "Fullscreen", 
            fillColor: 0x11246b, 
            textStyle: {
                color: "#e5e6e7",
                fontSize: `${mdFont}rem`
            },
            onClick: () => this.fullscreen()
        });

        const exitButton = new RectButton(this, {
            x: 0,
            y: 0,
            width: 120,
            height: 70,
            text: "Exit", 
            fillColor: 0x11246b, 
            textStyle: {
                color: "#e5e6e7",
                fontSize: `${mdFont}rem`
            },
            onClick: () => this.exit()
        });

        const bodyImage = new Phaser.GameObjects.Image(this, 0, 0, "results_dialog_body").setDepth(2);
        const imageWidth = dialogWidth - 50;
        const imageHeight = getFitHeight(imageWidth, bodyImage.width, bodyImage.height);
        bodyImage.setDisplaySize(imageWidth, imageHeight);

        startButton.setDepth(2);
        exitButton.setDepth(2);
        fullscreenButton.setDepth(2);
        bg.setDepth(1);
        this.add.existing(bg);
        this.add.existing(bodyImage);
        this.add.existing(startButton);
        this.add.existing(fullscreenButton);
        this.add.existing(exitButton);
        let choicesContent = null;

        if (PageUtils.isIframe() || !PageUtils.isMobile()) {
            choicesContent = [levelLabel, highscoreLabel, startButton, fullscreenButton, exitButton]
        }
        else {
            choicesContent = [levelLabel, highscoreLabel, startButton, exitButton];
            fullscreenButton.setVisible(false);
        }
         
        const config: Dialog.IConfig = {
            x: width/2,
            y: height/2,
            width: dialogWidth,
            height: dialogHeight,
            background: bg,
            description: bodyImage,
            content: titleLabel,
            choices: choicesContent,
            align: {
                content: "center",
                choices: "center",
            },
            expand: {
                choices: false,
                actions: false,
                title: false,
                description: false
            },
            space: {
                left: 70,
                right: 70,
                top: 70,
                bottom: 70,
                content: 70,
                description: 70,
                choice: 30,
                choices: 70
            }
        };
        
        const dialog = new Dialog(this, config);
        dialog.layout();

        this._fullscreenButton = fullscreenButton;
        this._dialog = dialog;
    }

    protected abstract startGame(): void;
    //protected abstract startTutorial(): void;

    protected onResize(): void {
        const height = this.game.canvas.height;
        const width = this.game.canvas.width;

        this._dialog.setPosition(width/2, height/2);
        this._dialog.layout();
    }

    private exit() {
        this.game.destroy(true, false);
        open("https://suxrobgm.github.io/browser-games/dist/games.html", "_self"); // opens list of games
    }

    private fullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
            this._fullscreenButton.setText("Fullscreen");
        }
        else {
            this.scale.startFullscreen();
            this._fullscreenButton.setText("Minimize");
        }
    }
}

function createLabel(scene: Phaser.Scene, text: string, style?: Phaser.Types.GameObjects.Text.TextStyle): Label {
    const textObj = new Phaser.GameObjects.Text(scene, 0, 0, text, style).setOrigin(0.5);
    const label = new Label(scene, { width: 400, text: textObj, align: "center", expandTextHeight: true }).setDepth(2);
    scene.add.existing(textObj);
    scene.add.existing(label);
    return label;
}

function getFitHeight(destWidth: number, srcWidth: number, srcHeight: number): number {
    const ratio = destWidth / srcWidth;
    return srcHeight * ratio;
}