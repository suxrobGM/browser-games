import { ResultsDialog } from "@core/resultsDialog";
import { GameBase } from "@core/scenes/gameBase";
import { ArrayUtils } from "@core/utils";
import { Utils } from "phaser";
import { ColoredWord, ColoredWordData } from "../objects/coloredWord";


export class Game extends GameBase {
    private _spawnArea: Phaser.GameObjects.Rectangle;
    private _words: ColoredWord[];
    private _wordsData: ColoredWordData[];
    private _colors: string[];
    private _spawnEvent: Phaser.Time.TimerEvent;
    private _elapsedSeconds: number;

    protected async onCreate() {
        super.onCreate();

        const height = this.game.canvas.height;
        const width = this.game.canvas.width;
        const dp = window.devicePixelRatio;
        const spawnAreaWidth = dp >= 2 ? width/2 + 200 : width/2 + 100;
        const spawnAreaHeight = dp >= 2 ?  height - 250 : height/2 + 100;

        this._spawnArea = new Phaser.GameObjects.Rectangle(this, width/2, this.healthbar.getBounds().bottom + 10, spawnAreaWidth, spawnAreaHeight);
        this._spawnArea.setOrigin(0.5, 0);
        this.add.existing(this._spawnArea);

        this._colors = new Array<string>();
        this._words = new Array<ColoredWord>();
        this._elapsedSeconds = 0;
        this._wordsData = await this.parseWordsJsonAsync();
        this._wordsData.forEach(wordData => {
            this._colors.push(wordData.color);
        });
        
        this.healthbar.onHealthOver = () => this.showGameResults();
        this.clock.onTimerCompleted = () => this.showGameResults();
    }

    protected onBegin(): void {
        const delayEachItem = this.currentLevel.data.delayEachItem as number;
        this.healthbar.setVisible(true);
        this._spawnEvent = this.time.addEvent({callback: this.spawnWords, callbackScope: this, delay: delayEachItem, loop: true, startAt: 0});
        this.clock.start();
    }

    protected onResize(): void {
        super.onResize();
        const width = this.game.canvas.width;
        this._spawnArea?.setPosition(width/2, this.healthbar.getBounds().bottom + 10);
    }

    private spawnWords() {
        this._elapsedSeconds++;

        if (this._words.length >= 3) {
            return;
        }

        this.roundScore = this.currentLevel.awardPoints;
        const randWord = this.createRandomWord();
        this._words.push(randWord);

        randWord.tweenVisible(() => {
            ArrayUtils.removeFromArray(randWord, this._words);
            randWord.destroy();
        });
    }

    private showGameResults() {
        this.clock.reset();
        this._spawnEvent.destroy();
        const resultsDialog = new ResultsDialog(this);
        resultsDialog.showModal(this.score);
    }

    private async parseWordsJsonAsync(): Promise<ColoredWordData[]> {
        const response = await fetch("assets/colors/words.json");
        const jsonData = await response.json();
        const words = (jsonData.words as ColoredWordData[]);
        return words;
    }

    private createRandomWord(): ColoredWord {
        const dp = window.devicePixelRatio;
        const fs = 2 * dp;
        const visibilityDuration = this.currentLevel.data.durationVisibility as number;
        const minCorrectItems = this.currentLevel.data.minCorrectItems as number;
        const correctnessFactor = Math.floor(this.clock.getStartTimeSeconds() / minCorrectItems);
        const randWord = Utils.Array.GetRandom(this._wordsData) as ColoredWordData;
        const randColor = this.getRandomColor(randWord.color);
        let displayColor = randColor;
        
        // correctness probability
        if ((this._elapsedSeconds % correctnessFactor) === 0) {
            displayColor = randWord.color; // display original color
        }

        const coloredWord = new ColoredWord(this, {
            x: 0, 
            y: 0,
            visibilityDuration: visibilityDuration,
            data: {
                text: randWord.text, 
                color: randWord.color
            }, 
            style: {
                fontSize: `${fs}rem`, 
                color: displayColor,
                fontStyle: "bold"
            },
            onClick: () => this.checkWordColor(coloredWord)
        });

        const randPos = this._spawnArea.getBounds().getRandomPoint();
        coloredWord.setPosition(randPos.x, randPos.y);
        coloredWord.setVisible(false);
        this.resolveOverlapping(coloredWord);
        this.add.existing(coloredWord);
        return coloredWord;
    }

    private getRandomColor(exceptColor: string): string {
        let randColor = Utils.Array.GetRandom(this._colors) as string;
        while (randColor === exceptColor) {
            randColor = Utils.Array.GetRandom(this._colors) as string;
        }

        return randColor;
    }

    private async checkWordColor(word: ColoredWord) {
        if (word.actualColor === word.originalColor) {
            this.addScore(this.roundScore);
            this.tweenCenterText(this.roundScore.toString());
        }
        else {
            await this.resultOverlay.showWrongResultAsync();
            this.healthbar.killHealth();
        }

        ArrayUtils.removeFromArray(word, this._words);
        word.tweenDestroy();
    }

    private resolveOverlapping(coloredWord: ColoredWord) {
        let isOverlapping = this.isOverlapping(coloredWord);
            
        while (isOverlapping) {
            const randPoint = this._spawnArea.getBounds().getRandomPoint();
            coloredWord.setPosition(randPoint.x, randPoint.y);
            isOverlapping = this.isOverlapping(coloredWord);
        }
    }

    private isOverlapping(obj: ColoredWord): boolean {
        let isOverlapping = false;
        const bounds = this._spawnArea;
        
        for (let i = 0; i < this._words.length; i++) {
            const item = this._words.at(i) as ColoredWord;

            if (item === obj) {
                continue;
            }

            const overlapsObj = Phaser.Geom.Intersects.RectangleToRectangle(item.getBounds(), obj.getBounds());
            const overlapsLineA = Phaser.Geom.Intersects.LineToRectangle(bounds.getBounds().getLineA(), obj.getBounds());
            const overlapsLineB = Phaser.Geom.Intersects.LineToRectangle(bounds.getBounds().getLineB(), obj.getBounds());
            const overlapsLineC = Phaser.Geom.Intersects.LineToRectangle(bounds.getBounds().getLineC(), obj.getBounds());
            const overlapsLineD = Phaser.Geom.Intersects.LineToRectangle(bounds.getBounds().getLineD(), obj.getBounds());
            isOverlapping = overlapsObj || overlapsLineA || overlapsLineB || overlapsLineC || overlapsLineD;

            if (isOverlapping) {
                break;
            }
        }
        return isOverlapping;
    }

    protected onDispose(): void {
        super.onDispose();

        this._words.forEach(word => {
            word.destroy();
        });
        
        this._words = [];
        this._spawnEvent?.destroy();
        this._elapsedSeconds = 0;
    }
}