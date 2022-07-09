import {Clock} from "phaser3-rex-plugins/templates/spinner/spinner-components.js";
import { ResultsDialog } from "@core/resultsDialog";
import { GameBase } from "@core/scenes/gameBase";
import { ThreadUtils } from "@core/utils";
import { Card } from "../objects/card";
import { CardsGrid } from "../objects/cardsGrid";

export class Game extends GameBase {
    private _cardsGrid: CardsGrid;
    private _lastCard: Card;
    private _spinner: Clock;

    protected onPreload(): void {
        super.onPreload();
        const assets = this.context.assetsPath;

        this.load.spritesheet("card_back", `${assets}/0.png`, {frameWidth: 500, frameHeight: 726});
        this.load.spritesheet("correct_choice", `${assets}/correct_choice.png`, {frameWidth: 640, frameHeight: 640});
        this.load.spritesheet("wrong_choice", `${assets}/wrong_choice.png`, {frameWidth: 641, frameHeight: 640});

        for (let i = 1; i <= 67; i++) {
            this.load.spritesheet(`card_${i}`, `${assets}/${i}.png`, {frameWidth: 500, frameHeight: 726});
        }
    }

    protected onCreate(): void {
        super.onCreate();

        const width = this.game.canvas.width;
        const timing = this.currentLevel.data.timing as number;
        this.addCardsGrid();

        this._spinner = new Clock(this, {x: width/2, y: this.scoreLabel.getBounds().bottom + 10, duration: timing, height: 64, width: 64});
        this._spinner.setOrigin(0.5, 0);
        this._spinner.setVisible(false);
        this.add.existing(this._spinner);
        this.clock.onTimerCompleted = () => this.showGameResults();
        this.healthbar.onHealthOver = () => this.showGameResults();
    }

    protected onBegin(): void {
        this.healthbar.setVisible(true);
        this.clock.start();
        this.startNewRound();
    }

    protected onResize(): void {
        super.onResize();
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        this._cardsGrid?.setPosition(width/2, height/2);
        this._spinner?.setPosition(width/2, this.scoreLabel.getBounds().bottom + 10);
    }

    private async startNewRound() {
        this.roundScore = this.currentLevel.awardPoints;
        const timing = this.currentLevel.data.timing as number;

        this.clock.pause();
        this._cardsGrid.shuffleCards();
        this._cardsGrid.setFrontFaces();
        this._cardsGrid.disableCards();

        this._cardsGrid.tweenStart(async () => {
            this._spinner.setVisible(true);
            this._spinner.start();

            await ThreadUtils.sleep(timing);
            this._cardsGrid.flipBackCards();
            this._cardsGrid.enableCards();
            this.clock.resume();
            this._spinner.stop();
            this._spinner.setVisible(false);
        });
    }

    private completeRound() {
        this.addScore(this.roundScore);
        this.tweenCenterText(this.roundScore.toString());

        this._cardsGrid.tweenEnd(() => {
            this.startNewRound();
        });
    }

    private showGameResults() {
        this.clock.reset();
        const resultsDialog = new ResultsDialog(this);
        resultsDialog.showModal(this.score);
    }

    private addCardsGrid() {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const cardsCount = this.currentLevel.data.cards as number;
        const rows = this.currentLevel.data.rows as number;
        const columns = this.currentLevel.data.rows as number;

        this._cardsGrid = new CardsGrid(this, {
            x: width/2, 
            y: height/2,
            cards: cardsCount,
            rows: rows,
            columns: columns,
            width: 140 * columns,
            height: 200 * rows,
        });
        
        this._cardsGrid.cards.forEach(card => {
            card.setCallback(() => this.checkPrevCard(card));
        });

        this._cardsGrid.setOrigin(0.5);
        this._cardsGrid.setVisible(false);
        this.add.existing(this._cardsGrid);
    }

    private async checkPrevCard(currentCard: Card) {
        if (this._lastCard !== currentCard &&
            this._lastCard?.getFrontTextureKey() === currentCard?.getFrontTextureKey()) 
        {
            this._lastCard.isRevealed = true;
            currentCard.isRevealed = true;
            this._lastCard = null;
        }
        else if (this._lastCard) {
            await ThreadUtils.sleep(500);
            this._lastCard?.flipBack();
            currentCard?.flipBack();
            this.healthbar.killHealth();
            await this.resultOverlay.showWrongResultAsync();
            this._lastCard = null;
        }
        else {
            this._lastCard = currentCard;
        }

        const allCardsRevealed = this._cardsGrid.cards.every(i => i.isRevealed);
        if (allCardsRevealed) {
            this._cardsGrid.cards.forEach(card => {
                card.isRevealed = false;
            });
            this.completeRound();
        }
    }

    protected onDispose(): void {
        super.onDispose();
        this._lastCard = null;
    }
}