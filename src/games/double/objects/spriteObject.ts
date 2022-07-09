import { PageUtils } from "@core/utils";
import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";

export class SpriteObject extends Phaser.GameObjects.Image {
    private readonly _config: SpriteObjectConfig;
    private _selected: boolean;
    private _outlinePipeline: OutlinePipelinePlugin;

    constructor(scene: Phaser.Scene, config?: SpriteObjectConfig) {
        config = getValidConfig(config);
        super(scene, config.x, config.y, config.texture);

        this._config = config;
        this._selected = false;
        this._outlinePipeline = scene.plugins.get("rexOutlinePipeline") as OutlinePipelinePlugin;

        this.setInteractive()
            .on("pointerover", () => this.enterHoverState())
            .on("pointerout", () => this.enterRestState())
            .on("pointerup", () => {
                this.enterHoverState();
                this._selected = true;

                if (this._config.onClick) {
                    this._config.onClick();
                }
            });
    }

    public get value(): number {
        return this._config.value;
    }

    public set value(value: number) {
        this._config.value = value;
    }

    public getTextureKey() {
        return this._config.texture;
    }

    public resetState() {
        this._selected = false;
        this.enterRestState();
    }

    public isSelected(): boolean {
        return this._selected;
    }

    private enterHoverState() {
        if (this._selected) {
            return;
        }

        if (PageUtils.isIOS()) {
            this.setFrame(1);
        }
        else {
            this._outlinePipeline.add(this, {
                outlineColor: 0xfffa00
            });
        }
    }
    
    private enterRestState() {
        if (this._selected) {
            return;
        }

        if (PageUtils.isIOS()) {
            this.setFrame(0);
        }
        else {
            this._outlinePipeline.remove(this);
        }
        
        this._selected = false;
    }
}

export type SpriteObjectConfig = {
    x: number, 
    y: number,
    texture: string,
    value?: number;
    onClick?: () => void;
}

function getValidConfig(config: SpriteObjectConfig): SpriteObjectConfig {
    if (!config.value) {
        config.value = 0;
    }

    return config;
}