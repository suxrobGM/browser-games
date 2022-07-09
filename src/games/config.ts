import OutlinePipelinePlugin from "phaser3-rex-plugins/plugins/outlinepipeline-plugin.js";

export const GlobalConfig: Phaser.Types.Core.GameConfig & GameCustomConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#344996",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "gameContainer",
        width: "100%",
        height: "100%",
        min: {
            width: 540,
            height: 960
        },
    },
    plugins: {
        global: [{
            key: "rexOutlinePipeline",
            plugin: OutlinePipelinePlugin,
            start: true
        }]
    },
    callbackUrl: "https://localhost:5001"
};

type GameCustomConfig = {
    callbackUrl: string;
}