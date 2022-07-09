export class Screen extends Phaser.GameObjects.Container {
    private _bgImage: Phaser.GameObjects.Image;
    private _textLabel: Phaser.GameObjects.Text;
    private _text: string;
    private _config: ScreenConfig;

    constructor(scene: Phaser.Scene, config: ScreenConfig) {
        const bgImage = new Phaser.GameObjects.Image(scene, 0, 0, "laptop");
        const width = getFitWidth(config.height, bgImage.width, bgImage.height);
        const contBounds = new Phaser.Geom.Rectangle(config.x, config.y, config.height, width);
        super(scene, contBounds.centerX, contBounds.centerY);
        
        this._text = config.text;
        this._bgImage = bgImage;
        this._config = config;

        this._textLabel = new Phaser.GameObjects.Text(scene, -10, -70, config.text, {fontSize: "54px", fontStyle: "bold", align: "center", color: "#000"});
        this._textLabel.setOrigin(0.5);
        this._bgImage.setDisplaySize(width, config.height);
        this.add(this._bgImage);
        this.add(this._textLabel);

        this.resize();
        scene.add.existing(this);
    }

    public get text(): string {
        return this._text;
    }

    public set text(value: string) {
        this._text = value.toUpperCase();
        this._textLabel.text = this._text;
    }

    public setText(value: string): Screen {
        this.text = value;
        return this;
    }

    private resize() {
        const strLen = this._textLabel.text.length;

        if (strLen < 6) {
            return;
        }

        const pad = strLen - 5;
        const scaleWidth = this._bgImage.displayWidth + pad*20;
        const scaleHeight = getFitHeight(scaleWidth, this._bgImage.width, this._bgImage.height);
        this._bgImage.setDisplaySize(scaleWidth, scaleHeight);
        const contBounds = new Phaser.Geom.Rectangle(this._config.x, this._config.y, scaleWidth, scaleHeight);
        this.setPosition(contBounds.centerX, contBounds.centerY);
    }
}

export type ScreenConfig = {
    x: number;
    y: number;
    height: number;
    text: string;
}

function getFitHeight(destWidth: number, srcWidth: number, srcHeight: number): number {
    const ratio = destWidth / srcWidth;
    return srcHeight * ratio;
}

function getFitWidth(destHeight: number, srcWidth: number, srcHeight: number): number {
    const ratio = destHeight / srcHeight;
    return srcWidth * ratio;
}