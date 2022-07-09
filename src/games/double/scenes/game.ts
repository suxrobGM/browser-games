/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultsDialog } from "@core/resultsDialog";
import { GameBase } from "@core/scenes/gameBase";
import { MathUtils } from "@core/utils";
import { Plate } from "../objects/plate";
import { SpriteObject } from "../objects/spriteObject";
import { ObjectSize } from "../types";

export class Game extends GameBase {
    private _lastSelectedObject: SpriteObject;
    private _plate1: Plate;
    private _plate2: Plate;

    protected onPreload(): void {
        super.onPreload();
        const assets = this.context.assetsPath;

        const lv = this.currentLevel.value;
        for (let i = 1; i <= 9; i++) {
            this.load.spritesheet(`${lv}_object_${i}`, `${assets}/lv${lv}/object_${i}.png`, {frameWidth: 258, frameHeight: 260});
        }
    }

    protected onCreate(): void {
        super.onCreate();
        this.clock.onTimerCompleted = () => this.showGameResults();
        this.addPlates();
    }

    protected onBegin() {
        this.startNewRound();
        this.clock.start();
    }

    protected onResize(): void {
        super.onResize();
        const width = this.game.canvas.width;

        try {
            this._plate1?.setPosition(width/2, this.clock.getBounds().bottom + 40);
            this._plate2?.setPosition(width/2, this._plate1.getBounds().bottom + 20);
        } catch (error) {
            // ignore
        }
    }

    private startNewRound() {
        this.roundScore = this.currentLevel.awardPoints;
        this.addObjects();
        this._plate1.setVisible(true).tweenStart()
        this._plate2.setVisible(true).tweenStart();
    }

    private completeRound() {
        this.addScore(this.roundScore);
        this.tweenCenterText(this.roundScore.toString());
        
        this._plate1.tweenEnd(() => {
            this._plate1.removeAllObjects();
        });
        this._plate2.tweenEnd(() => {
            this._plate2.removeAllObjects();
            this.startNewRound();
        });
    }

    private addPlates() {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const dp = window.devicePixelRatio;
        const plateWidth = dp >= 2 ? width - 50 : 400;
        const plateHeight = dp >= 2 ? (height/2) - 150 : 400;

        this._plate1 = new Plate(this, {
            x: width/2, 
            y: this.clock.getBounds().bottom + 40, 
            width: plateWidth, 
            height: plateHeight, 
            anchor: {x: 0.5, y: 0}
        });
            
        this._plate2 = new Plate(this, {
            x: width/2, 
            y: this._plate1.getBounds().bottom + 20, 
            width: plateWidth, 
            height: plateHeight, 
            fallFromTop: false, 
            anchor: {x: 0.5, y: 0}
        });

        this._plate1.setVisible(false);
        this._plate2.setVisible(false);
    }

    private addObjects() {
        const lv = this.currentLevel.value;
        const objSize = this.currentLevel.data.objectSize as ObjectSize;
        const dp = window.devicePixelRatio;
        let indexes = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        indexes = Phaser.Utils.Array.Shuffle(indexes);

        for (let i = 0; i < 9; i++) {
            const obj = new SpriteObject(this, {x: 0, y: 0, texture: `${lv}_object_${indexes[i]}`, onClick: () => this.checkPrevObject(obj)});
            let size = MathUtils.getRandom(objSize.min, objSize.max);
            size = dp >= 2 ? size * 2 : size;
            obj.setDisplaySize(size, size);

            if (i >= 0 && i <= 4) {   
                this._plate1.addObject(obj);
            }
            else if (i >= 5 && i <= 8) {
                this._plate2.addObject(obj);
            }
        }

        const sameObj = new SpriteObject(this, {x: 0, y: 0, texture: `${lv}_object_${indexes[4]}`, onClick: () => this.checkPrevObject(sameObj)});
        let size = MathUtils.getRandom(objSize.min, objSize.max);
        size = dp >= 2 ? size * 2 : size;
        sameObj.setDisplaySize(size, size);
        this._plate2.addObject(sameObj);
    }

    private async checkPrevObject(currentObject: SpriteObject) {
        if (this._lastSelectedObject !== currentObject &&
            this._lastSelectedObject?.getTextureKey() === currentObject.getTextureKey()) 
        {
            this._lastSelectedObject.setVisible(false);
            currentObject.setVisible(false);
            this._lastSelectedObject.resetState();
            currentObject.resetState();
            this._lastSelectedObject = null;
            this.completeRound();
        }
        else if (this._lastSelectedObject && this._lastSelectedObject !== currentObject) {
            this._lastSelectedObject.resetState();
            currentObject.resetState();
            await this.resultOverlay.showWrongResultAsync();
            this._lastSelectedObject = null;
        }
        else {
            this._lastSelectedObject = currentObject;
        }
    }

    private showGameResults() {
        this._plate1.tweenEnd(() => {
            this._plate1.removeAllObjects();
        });
        this._plate2.tweenEnd(() => {
            this._plate2.removeAllObjects();
        });

        this.clock.reset();
        const resultsDialog = new ResultsDialog(this);
        resultsDialog.showModal(this.score);
    }

    protected onDispose(): void {
        super.onDispose();
        this._lastSelectedObject = null;
    }
}