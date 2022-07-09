import { RoundRectangle } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import { SpriteObject } from "./spriteObject";

export class Plate extends Phaser.GameObjects.GameObject {
    private readonly _config: PlateConfig;
    private _x: number;
    private _y: number;
    private _outerBounds: Phaser.GameObjects.Rectangle;
    private _startTween: Phaser.Tweens.Tween;
    private _endTween: Phaser.Tweens.Tween;
    private _container: Phaser.GameObjects.Container;
    private _rect: RoundRectangle;

    constructor(scene: Phaser.Scene, config?: PlateConfig) {
        config = getValidConfig(config);

        super(scene, "Plate");
        this._config = config;
        this._x = config.x;
        this._y = config.y;

        this._outerBounds = new Phaser.GameObjects.Rectangle(scene, config.x, config.y, config.width, config.height);
        this._outerBounds.setOrigin(config.anchor.x, config.anchor.y);

        this._container = new Phaser.GameObjects.Container(scene, this._outerBounds.getBounds().centerX, this._outerBounds.getBounds().centerY);
        this._rect = new RoundRectangle(scene, 0, 0, config.width, config.height, config.borderRadius, config.fillColor, config.fillAlpha);
        this._startTween = this.createTweenStart();
        this._endTween = this.createTweenEnd();
        
        this._outerBounds.setVisible(false);
        this._rect.setDepth(-2);
        this._container.setAlpha(0.3).setDepth(-1);
        this._container.add(this._rect);

        this.scene.add.existing(this._container);
        this.scene.add.existing(this._outerBounds);
    }

    //#region Properties
    
    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._outerBounds.setPosition(value, this.y);
        this._container.setPosition(this._outerBounds.getBounds().centerX, this._outerBounds.getBounds().centerY);
        this._x = value;
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._outerBounds.setPosition(this.x, value);
        this._container.setPosition(this._outerBounds.getBounds().centerX, this._outerBounds.getBounds().centerY);
        this._y = value;
    }

    //#endregion
    
    //#region Public methods

    public getBounds(): Phaser.Geom.Rectangle {
        return this._rect.getBounds();
    }

    public getRandomPoint(): Phaser.Math.Vector2 {
        const bounds = this.getBounds();
        const innerBounds = new Phaser.Geom.Rectangle(bounds.x + 30, bounds.y + 30, bounds.width - 60, bounds.height - 60);
        const randPoint = innerBounds.getRandomPoint();
        return this._container.getLocalPoint(randPoint.x, randPoint.y);
    }

    public getObjects(): SpriteObject[] {
        return this._container.list.slice(1) as SpriteObject[];
    }

    public contains(obj: SpriteObject): boolean {
        this.getObjects().forEach(item => {
            if (item.getTextureKey() === obj.getTextureKey()) {
                return true;
            }
        });

        return false;
    }

    public setVisible(value: boolean): Plate {
        this._container.setVisible(value);
        return this;
    }

    public setPosition(x: number, y?: number): Plate {
        if (y === undefined) {
            y = x;
        }

        this.x = x;
        this.y = y;
        return this;
    }

    public setSize(width: number, height: number): Plate {
        this._outerBounds.setSize(width, height);
        this._outerBounds.setPosition(this.x, this.y);
        this._container.setSize(width, height);
        this._container.setPosition(this._outerBounds.getBounds().centerX, this._outerBounds.getBounds().centerY);
        return this;
    }

    public setOrigin(x?: number, y?: number): Plate {
        if (x === undefined) {
            x = 0;
        }
        if (y === undefined) {
            y = x;
        }
        
        this._outerBounds.setOrigin(x, y);
        this._outerBounds.setPosition(this.x, this.y);
        this._container.setPosition(this._outerBounds.getBounds().centerX, this._outerBounds.getBounds().centerY);
        return this;
    }

    public addObject(obj: SpriteObject): Plate {
        const randPoint = this.getRandomPoint();
        obj.setPosition(randPoint.x, randPoint.y);
        this._container.add(obj);
        return this;
    }

    public removeAllObjects(): Plate {
        this._container.removeBetween(1, this._container.length - 1, true);
        return this;
    }

    public tweenStart(callback?: () => void) {
        const height = this.scene.game.canvas.height;
        let yPos = this._config.height + height;

        if (this._config.fallFromTop) {
            yPos = -this._config.height; // falls from the top
        }
        
        this.resolveOverlapping();
        this._container.setY(yPos);

        this._startTween.once("complete", () => {
            this._container.setY(this._outerBounds.getBounds().centerY);
            if (callback) {
                callback();
            }
        });

        this._startTween.play();
    }

    public tweenEnd(callback?: () => void) {
        const height = this.scene.game.canvas.height;
        let yPos = this._config.height + height;

        if (this._config.fallFromTop) {
            yPos = -this._config.height; // comes back to top
        }

        this._endTween.once("complete", () => {
            this._container.setY(yPos);
            if (callback) {
                callback();
            }
        });

        this._endTween.play();
    }

    //#endregion

    
    //#region Internal methods

    private createTweenStart(): Phaser.Tweens.Tween {
        const tween = this.scene.tweens.create({
            targets: this._container,
            duration: 500,
            loop: 0,
            ease: "Cubic.easeIn",
            props: {
                y: this._outerBounds.getBounds().centerY,
                alpha: 1
            }
        });

        return tween;
    }

    private createTweenEnd(): Phaser.Tweens.Tween {
        const height = this.scene.game.canvas.height;

        let yPos = this._config.height + height;
        if (this._config.fallFromTop) {
            yPos = -this._config.height; // comes back to top
        }

        const tween = this.scene.tweens.create({
            targets: this._container,
            duration: 500,
            loop: 0,
            ease: "Cubic.easeIn",
            props: {
                y: yPos,
                alpha: 0.3
            }
        });

        return tween;
    }

    private isOverlapping(obj: SpriteObject): boolean {
        let isOverlapping = false;
        const bounds = this.getBounds();
        const innerBounds = new Phaser.Geom.Rectangle(bounds.x + 30, bounds.y + 30, bounds.width - 60, bounds.height - 60);
        
        for (let i = 1; i < this._container.length; i++) {
            const item = this._container.getAt(i) as SpriteObject;

            if (item === obj) {
                continue;
            }

            const overlapsObj = Phaser.Geom.Intersects.RectangleToRectangle(item.getBounds(), obj.getBounds());
            const overlapsLineA = Phaser.Geom.Intersects.LineToRectangle(innerBounds.getLineA(), obj.getBounds());
            const overlapsLineB = Phaser.Geom.Intersects.LineToRectangle(innerBounds.getLineB(), obj.getBounds());
            const overlapsLineC = Phaser.Geom.Intersects.LineToRectangle(innerBounds.getLineC(), obj.getBounds());
            const overlapsLineD = Phaser.Geom.Intersects.LineToRectangle(innerBounds.getLineD(), obj.getBounds());
            
            isOverlapping = overlapsObj || overlapsLineA || overlapsLineB || overlapsLineC || overlapsLineD;

            if (isOverlapping) {
                break;
            }
        }
        return isOverlapping;
    }

    private resolveOverlapping() {
        this.getObjects().forEach(obj => {
            let isOverlapping = this.isOverlapping(obj);

            while (isOverlapping) {
                const randPoint = this.getRandomPoint();
                obj.setPosition(randPoint.x, randPoint.y);
                isOverlapping = this.isOverlapping(obj);
            }
        });
    }

    //#endregion
}

export type PlateConfig = {
    x: number;
    y: number;
    width?: number;
    height?: number;
    fillColor?: number;
    fillAlpha?: number;
    borderRadius?: number;
    fallFromTop?: boolean;
    anchor?: {
        x?: number,
        y?: number
    }
}

function getValidConfig(config: PlateConfig): PlateConfig {
    if (config.width === undefined) {
        config.width = 128;
    }
    if (config.height === undefined) {
        config.height = 128;
    }
    if (config.fillColor === undefined) {
        config.fillColor = 0x11246b;
    }
    if (config.fillAlpha === undefined) {
        config.fillAlpha = 1;
    }
    if (config.borderRadius === undefined) {
        config.borderRadius = 32;
    }
    if (config.fallFromTop === undefined) {
        config.fallFromTop = true;
    }

    if (config.anchor === undefined) {
        config.anchor = {
            x: 0,
            y: 0
        };
    }

    return config;
}
