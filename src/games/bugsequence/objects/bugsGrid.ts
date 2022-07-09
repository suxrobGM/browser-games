import { ThreadUtils } from "@core/utils";
import { Utils } from "phaser";
import { GridSizer } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import { Bug } from "./bug";

export class BugsGrid extends GridSizer {
    private _config: BugsGridConfig;
    private _activeBugs: Bug[];
    private _hiddenBugs: Bug[];
    private _isRevealingActiveBugs: boolean;
    private _resetBugs: boolean;

    constructor(scene: Phaser.Scene, config: BugsGridConfig) {
        config = getValidConfig(config);

        super(scene, {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            column: config.columns,
            row: config.columns,
            columnProportions: 1,
            rowProportions: 1,
            space: {
                row: 10,
                column: 10
            },

            createCellContainerCallback: createBug
        });

        this._config = config;
        this._activeBugs = [];
        this._hiddenBugs = this.getChildren() as Bug[];
        this._isRevealingActiveBugs = false;
        this._resetBugs = false;
        this.shuffleBugs();
        this.layout();
        //this.drawBounds(scene.add.graphics());
    }

    public getActiveBugs(): Bug[] {
        return this._activeBugs;
    }

    public getHiddenBugs(): Bug[] {
        return this._hiddenBugs;
    }

    public async revealActiveBugsAsync() {
        if (this._isRevealingActiveBugs) {
            return;
        }

        this._isRevealingActiveBugs = true;

        for (const bug of this._activeBugs) {
            bug.tweenActiveState();
            await ThreadUtils.sleep(this._config.activeBugsRevealDuration + 1000);
            bug.tweenHiddenState();
            await ThreadUtils.sleep(1000);
        }

        this._isRevealingActiveBugs = false;
    }

    public shuffleBugs() {
        const bugsCound = this._config.activeBugsCount;
        const bugs = Utils.Array.Shuffle(this.getChildren()) as Bug[];
        this._activeBugs = [];

        if (!this._resetBugs) {
            this.resetBugs();
        }

        for (let i = 0; i < bugsCound && bugs.length; i++) {
            const randomBug = bugs[i];

            randomBug.setCallback(() => {
                if (this._isRevealingActiveBugs) {
                    return;
                }

                randomBug.tweenActiveState();
            });

            this._activeBugs.push(randomBug);
        }

        this._resetBugs = false;
    }

    public tweenStart(callback?: () => void) {
        this.scene.add.tween({
            targets: this,
            yoyo: false,
            loop: 0,
            duration: 500,
            ease: "Cubic.easeIn",
            props: {
                y: this._config.y
            },
            onStart: () => {
                this.setY(-this.height);
                this.setVisible(true);
            },
            onComplete: () => {
                this.setY(this._config.y);

                if (callback) {
                    callback();
                }
            }
        });
    }

    public tweenEnd(callback?: () => void) {
        const gameHeight = this.scene.game.canvas.height;

        this.scene.add.tween({
            targets: this,
            yoyo: false,
            loop: 0,
            duration: 500,
            ease: "Cubic.easeIn",
            props: {
                y: this.height + gameHeight
            },
            onStart: () => {
                this.setVisible(true);
            },
            onComplete: () => {
                this.setVisible(false);
                this.setY(-this.height);

                if (callback) {
                    callback();
                }
            }
        });
    }

    private resetBugs() {
        for (const child of this._hiddenBugs) {
            const bug = child as Bug;
            bug.setHiddenState();
            bug.isRevealed = false;
            
            bug.setCallback(() => {
                if (this._isRevealingActiveBugs) {
                    return;
                }
                bug.tweenHiddenState();
            });
        }

        this._resetBugs = true;
    }
}

export type BugsGridConfig = {
    x: number;
    y: number;
    width?: number;
    height?: number;
    activeBugsCount?: number;
    activeBugsRevealDuration?: number;
    activeBugTexture?: string;
    wrongBugTexture?: string;
    hiddenBugTexture?: string;
    rows?: number;
    columns?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createBug(scene: Phaser.Scene, x: number, y: number, config: any): Phaser.GameObjects.GameObject 
{
    config.expand = false;
    const bug = new Bug(scene, {x: 0, y: 0});
    bug.setDisplayHeight(100);
    scene.add.existing(bug);
    return bug;
}

function getValidConfig(config: BugsGridConfig): BugsGridConfig {
    if (!config.width) {
        config.width = 100;
    }
    if (!config.height) {
        config.height = 100;
    }
    if (!config.rows) {
        config.rows = 6;
    }
    if (!config.columns) {
        config.columns = 4;
    }
    if (!config.activeBugsCount) {
        config.activeBugsCount = 3;
    }
    if (!config.activeBugsRevealDuration) {
        config.activeBugsRevealDuration = 1000;
    }
    if (!config.activeBugTexture) {
        config.activeBugTexture = "bug_active";
    }
    if (!config.wrongBugTexture) {
        config.wrongBugTexture = "bug_wrong";
    }
    if (!config.hiddenBugTexture) {
        config.hiddenBugTexture = "bug_hidden";
    }

    return config;
}