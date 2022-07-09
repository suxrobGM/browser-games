/* eslint-disable @typescript-eslint/no-explicit-any */
import { MathUtils } from "@core/utils";
import { Utils } from "phaser";
import { GridSizer } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import { Card } from "./card";

export class CardsGrid extends GridSizer {
    private readonly _config: CardsGridConfig;
    private _cards: Card[];

    constructor(scene: Phaser.Scene, config: CardsGridConfig) {
        config = getValidConfig(config);
        const dp = window.devicePixelRatio >= 2 ? 1.5 : 1;
        const cards = new Array<Card>();
        
        super(scene, {
            x: config.x,
            y: config.y,
            width: config.width * dp,
            height: config.height * dp,
            column: config.columns,
            row: config.rows,
            columnProportions: 1,
            rowProportions: 1,
            space: {
                row: 10,
                column: 10
            },
            createCellContainerCallback: (scene, x, y, config: any): Phaser.GameObjects.GameObject => {
                config.expand = false;
                const card = createCard(scene, `card_1`);
                cards.push(card as Card);
                return card;
            }
        });

        this._config = config;
        this._cards = cards;
        this.shuffleCards();
        this.layout();
    }

    public get cards(): Card[] {
        return this._cards;
    }

    public flipBackCards() {
        this._cards.forEach(card => {
            card.flipBack();
        });
    }

    public flipOpenCards() {
        this._cards.forEach(card => {
            card.flipOpen();
        });
    }

    public disableCards() {
        this._cards.forEach(card => {
            card.disableInteractive();
        });
    }

    public enableCards() {
        this._cards.forEach(card => {
            card.setInteractive();
        });
    }

    public setBackFaces(): CardsGrid {
        this._cards.forEach(card => {
            card.setBackFace();
        });

        return this;
    }

    public setFrontFaces(): CardsGrid {
        this._cards.forEach(card => {
            card.setFrontFace();
        });

        return this;
    }

    public shuffleCards() {
        let randIndex = MathUtils.getRandom(1, 67);

        for (let i = 0; i < this.getChildren().length; i++) {
            const card = this.getChildren().at(i) as Card;
            
            if (i % 2 === 0) {
                randIndex = MathUtils.getRandom(1, 67);
            }

            card.frontFace.setTexture(`card_${randIndex}`);
        }

        Utils.Array.Shuffle(this.getChildren());
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
}

export type CardsGridConfig = {
    x: number;
    y: number;
    width?: number;
    height?: number;
    cards?: number;
    rows?: number;
    columns?: number;
    revealDuration?: number;
}

function createCard(scene: Phaser.Scene, texture: string): Phaser.GameObjects.GameObject {
    const card = new Card(scene, {
        x: 0,
        y: 0,
        frontTexture: texture
    });

    const dp = window.devicePixelRatio >= 2 ? 1.5 : 1;
    card.setDisplayHeight(200 * dp);
    return card;
}

function getValidConfig(config: CardsGridConfig): CardsGridConfig {
    if (!config.width) {
        config.width = 100;
    }
    if (!config.height) {
        config.height = 100;
    }
    if (!config.cards) {
        config.cards = 4;
    }
    if (!config.rows) {
        config.rows = config.cards / 2;
    }
    if (!config.columns) {
        config.columns = config.cards / 2;
    }
    if (!config.revealDuration) {
        config.revealDuration = 1000;
    }

    return config;
}