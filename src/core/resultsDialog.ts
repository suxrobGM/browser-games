import { Dialog, Label, RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import { ModalBehavoir } from "phaser3-rex-plugins/plugins/modal.js";
import { RectButton } from "@core/objects/rectButton";
import { SceneBase } from "@core/scenes/sceneBase";

export class ResultsDialog extends Dialog {
    private _scoreLabel: Label;
    private _titleLabel: Label;
    private _newRecordLabel: Label;
    private _nextButton: RectButton;

    constructor(scene: SceneBase) {
        const width = scene.game.canvas.width;
        const height = scene.game.canvas.height;
        const dialogWidth = width > 600 ? 400 : 300;
        const dialogHeight = height > 600 ? 600 : 450;
        const dps = window.devicePixelRatio;
        const smFont = 1 * dps;
        const mdFont = 2 * dps;
        const lgFont = 3 * dps;
        
        const bg = new RoundRectangle(scene, 0, 0, 0, 0, 32, 0x344996, 1);
        const titleLabel = createLabel(scene, "Results", {fontSize: `${mdFont}rem`});
        const scoreLabel = createLabel(scene, "6400 | 6400", {fontSize: `${lgFont}rem`});
        const newRecordLabel = createLabel(scene, "New record!", {fontSize: `${smFont}rem`, color: "#cbc647"});
        const nextButton = new RectButton(scene, {
            x: 0,
            y: 0,
            width: 120,
            height: 70,
            text: "Next", 
            fillColor: 0x11246b, 
            textStyle: {
                color: "#e5e6e7",
                fontSize: `${mdFont}rem`
            }
        });

        const bodyImage = new Phaser.GameObjects.Image(scene, 0, 0, "results_dialog_body");
        const imageWidth = dialogWidth - 50;
        const imageHeight = getFitHeight(imageWidth, bodyImage.width, bodyImage.height);
        bodyImage.setDisplaySize(imageWidth, imageHeight);
        bodyImage.setDepth(999);
        bg.setDepth(998);
        titleLabel.setDepth(999);
        scoreLabel.setDepth(999);
        newRecordLabel.setDepth(999);
        nextButton.setDepth(999);

        scene.add.existing(bg);
        scene.add.existing(bodyImage);
        scene.add.existing(nextButton);

        const config: Dialog.IConfig = {
            x: width/2,
            y: height/2,
            width: dialogWidth,
            height: dialogHeight,
            background: bg,
            description: bodyImage,
            content: titleLabel,
            choices: [
                scoreLabel,
                newRecordLabel,
                nextButton
            ],
            align: {
                content: "center",
                choices: "center",
                actions: "center"
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
                choice: 10,
                choices: 70
            }
        };

        super(scene, config);
        this._scoreLabel = scoreLabel;
        this._titleLabel = titleLabel;
        this._nextButton = nextButton;
        this._newRecordLabel = newRecordLabel;
        this.layout();
        this.setVisible(false);
    }

    public showModal(score: number) {
        const highscore = (this.scene as SceneBase).context.sessionData.highscore;
        const callbackUrl = (this.scene as SceneBase).context.callbackUrl;
        const newRecordText = this._newRecordLabel.getElement("text") as Phaser.GameObjects.Text;
        
        if (score > highscore) {
            newRecordText.setColor("#cbc647");
        }
        else {
            newRecordText.setColor("#344996");
        }

        this.handleGameResults(score, callbackUrl);
        this.setVisible(true);

        new ModalBehavoir(this, {
            anyTouchClose: false,
            manualClose: true,
            duration: {
                in: 500,
                out: 500
            },
            transitIn: 0,
            transitOut: 0
        });
    }

    private handleGameResults(score: number, callbackUrl?: string) {
        const dp = window.devicePixelRatio;
        const currentLevel = (this.scene as SceneBase).context.getCurrentLevel();
        const nextLevel = (this.scene as SceneBase).context.getNextLevel();
        const data = (this.scene as SceneBase).context.sessionData;
        const mdFont = 1.6 * dp * 16;
        
        this._scoreLabel.text = score.toString();
        const unclockScore = currentLevel.nextLevelTreshold;
        let levelToUnlock = currentLevel;
        const title = this._titleLabel.getElement("text") as Phaser.GameObjects.Text;

        if (currentLevel.value !== nextLevel.value && unclockScore !== 0 && score >= unclockScore) 
        {
            title.text = "Congratulations!\nYou unlocked the next level!";
            title.setFontSize(dp >= 2 ? 40 : mdFont);
            levelToUnlock = nextLevel;
        }
        else {
            title.text = "Results";
            title.setFontSize(mdFont);
        }

        this._nextButton.setCallback(() => {
            // TODO: need to change callback url
            const url = `?gameId=${data.gameId}&playerId=${data.playerId}&sessionId=${data.sessionId}&rank=${data.rank}&highscore=${score}&level=${levelToUnlock.value}&timestamp=${data.timestamp}&signature=${data.signature}`
            open(url, "_self");
        });
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

// function getFitWidth(destHeight: number, srcWidth: number, srcHeight: number): number {
//     const ratio = destHeight / srcHeight;
//     return srcWidth * ratio;
// }