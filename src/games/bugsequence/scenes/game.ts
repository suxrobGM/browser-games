import { ResultsDialog } from "@core/resultsDialog";
import { GameBase } from "@core/scenes/gameBase";
import { ThreadUtils } from "@core/utils";
import { BugsGrid } from "../objects/bugsGrid";

export class Game extends GameBase {
    private _bugsGrid: BugsGrid;

    protected onPreload(): void {
        super.onPreload();
        const assets = this.context.assetsPath;
        this.load.spritesheet("bug_active", `${assets}/bug_active.png`, {frameWidth: 350, frameHeight: 305});
        this.load.spritesheet("bug_hidden", `${assets}/bug_hidden.png`, {frameWidth: 350, frameHeight: 305});
        this.load.spritesheet("bug_wrong", `${assets}/bug_wrong.png`, {frameWidth: 349, frameHeight: 305});
    }

    protected onCreate(): void {
        super.onCreate();
        this.addBugsGrid();
        this.clock.onTimerCompleted = () => this.showGameResults();
    }

    protected onBegin() {
        this._bugsGrid.tweenStart(async () => {
            await ThreadUtils.sleep(1000);
            await this.revealBugsAsync();
            this.tweenCenterText("START");
            this.clock.start();
        });
    }

    protected onResize(): void {
        super.onResize();
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        this._bugsGrid?.setPosition(width/2, height/2);
    }

    private startNewRound() {
        this.roundScore = this.currentLevel.awardPoints;
        this._bugsGrid.shuffleBugs();

        this._bugsGrid.tweenStart(async () => {
            this.clock.paused = true;
            await ThreadUtils.sleep(1000);
            await this.revealBugsAsync();
            this.tweenCenterText("START");
            this.clock.paused = false;
        });
    }

    private completeRound() {
        this.addScore(this.roundScore);
        this.tweenCenterText(this.roundScore.toString());

        this._bugsGrid.tweenEnd(() => {
            this.startNewRound();
        });
    }

    private showGameResults() {
        this.clock.reset();
        const resultsDialog = new ResultsDialog(this);
        resultsDialog.showModal(this.score);
    }

    private addBugsGrid(): BugsGrid {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const sequenceLength = this.currentLevel.data.sequenceLength as number;
        const rows = this.currentLevel.data.rows as number;
        const columns = this.currentLevel.data.columns as number;
        const revealDuration = this.currentLevel.data.revealDuration as number;

        this._bugsGrid = new BugsGrid(this, {
            x: width/2,
            y: height/2,
            width: 150 * columns,
            height: 135 * rows,
            activeBugsCount: sequenceLength,
            activeBugsRevealDuration: revealDuration,
            rows: rows,
            columns: columns
        });

        this._bugsGrid.setOrigin(0.5);
        this._bugsGrid.setVisible(false);
        this.add.existing(this._bugsGrid);
        return this._bugsGrid;
    }

    private async revealBugsAsync() {
        await this._bugsGrid.revealActiveBugsAsync();
        const activeBugs = this._bugsGrid.getActiveBugs();

        activeBugs.forEach(bug => {
            bug.setCallback(async () => {
                if (bug.isRevealed) {
                    return;
                }
                
                const bugIndex = activeBugs.indexOf(bug);

                if (bugIndex === 0 || activeBugs[bugIndex - 1].isRevealed) {
                    bug.tweenActiveState();
                    bug.isRevealed = true;

                    if (this.allBugsRevealed()) {
                        await ThreadUtils.sleep(500);
                        this.completeRound();
                    }
                }
                else {
                    bug.tweenWrongState(true);
                    await this.resultOverlay.showWrongResultAsync();
                    activeBugs.forEach(bug => {
                        if (bug.isRevealed) {
                            bug.isRevealed = false;
                            bug.tweenHiddenState();
                        }
                    });
                    return;
                }
            });
        });
    }

    private allBugsRevealed(): boolean {
        const activeBugs = this._bugsGrid.getActiveBugs();
        return activeBugs.every((bug) => bug.isRevealed);
    }
}