import { SceneBase } from "@core/scenes/sceneBase";

export class FullscreenButton extends Phaser.GameObjects.Image {
    constructor(scene: SceneBase, config: FullscreenButtonConfig) {
        config = getValidConfig(config);
        super(scene, config.x, config.y, config.texture);
        
        this.setDisplaySize(config.width, config.height);
        this.setInteractive()
            .on("pointerup", () => {
                if (scene.scale.isFullscreen) {
                    scene.scale.stopFullscreen();
                    this.setFrame(0);
                }
                else {
                    scene.scale.startFullscreen();
                    this.setFrame(1);
                }
            });
    }
}

export type FullscreenButtonConfig = {
    x: number;
    y: number;
    texture: string;
    width?: number;
    height?: number;
}

function getValidConfig(config: FullscreenButtonConfig): FullscreenButtonConfig {
    const dp = window.devicePixelRatio;

    if (!config.width) {
        config.width = dp >= 2 ? 70 : 38;
    }
    if (!config.height) {
        config.height = dp >= 2 ? 70 : 38;
    }

    return config;
}