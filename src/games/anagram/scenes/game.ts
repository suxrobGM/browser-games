import { GameBase } from "@core/scenes/gameBase";
import { Anagram } from "../anagram";
import { ResultsDialog } from "@core/resultsDialog";
import { ScreenChoices } from "../objects/screenChoices";

export class Game extends GameBase {
    private _screenChoices: ScreenChoices;
    private _isCheckingWord: boolean;

    protected onPreload(): void {
        super.onPreload();
        const assets = this.context.assetsPath;
        this.load.spritesheet(`letter_button`, `${assets}/letter_button.png`, {frameWidth: 232, frameHeight: 247});
        this.load.spritesheet(`laptop`, `${assets}/laptop.png`, {frameWidth: 1099, frameHeight: 1253});
    }

    protected async onCreate() {
        super.onCreate();
        const width = this.game.canvas.width;
        this._isCheckingWord = false;
        this._screenChoices = new ScreenChoices(this, {x: width/2 - 200, y: 150, height: 800, text: ""});
        this._screenChoices.setVisible(false);

        this.healthbar.onHealthOver = () => this.showGameResults();
        this.clock.onTimerCompleted = () => this.showGameResults();
    }

    protected onBegin() {
        this.startNewRound(); 
        this.clock.start();
        this.healthbar.setVisible(true);
    }

    protected onResize(): void {
        super.onResize();
        const width = this.game.canvas.width;
        this._screenChoices?.setPosition(width/2 - 200, 150);
    }

    private async startNewRound() {
        this.roundScore = this.currentLevel.awardPoints;
        const randomWord = await Anagram.getRandomWordAsync(this.currentLevel.data.wordLength);
        this._screenChoices.setText(randomWord);
        this._screenChoices.choices.forEach(choiceButton => {
            choiceButton.setCallback(() => {
                this.checkWord(choiceButton.text);
            });
        });
        this._screenChoices.tweenStart();
    }

    private completeRound() {
        this.addScore(this.roundScore);
        this._screenChoices.tweenEnd(() => {
            this.startNewRound();
        });
    }

    private async checkWord(word: string) {
        if (this._isCheckingWord) {
            return;
        }

        this._isCheckingWord = true;
        const isAnagram = Anagram.check(word, this._screenChoices.text);

        if (!isAnagram) {
            await this.resultOverlay.showWrongResultAsync();
            this.healthbar.killHealth();
            this._isCheckingWord = false;
            return;
        }

        this._isCheckingWord = false;
        this.tweenCenterText(this.roundScore.toString());
        this.completeRound();
    }

    private showGameResults() {
        this._screenChoices.tweenEnd();
        this.clock.reset();
        const resultsDialog = new ResultsDialog(this);
        resultsDialog.showModal(this.score);
    }
}