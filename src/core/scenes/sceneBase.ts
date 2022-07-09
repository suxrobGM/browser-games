/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import "phaser"
import { Context } from "@core/context";

export abstract class SceneBase extends Phaser.Scene {
    private _sceneContext: Context;
    private _disposing: boolean;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    public get context(): Context {
        return this._sceneContext;
    }

    protected onInit(data?: any) {}
    protected onPreload() {}
    protected onCreate(data?: any) {}
    protected onUpdate(time: number, delta: number) {}
    protected onResize() {}
    protected onOrientationChange(orientation: Phaser.Scale.Orientation) {}
    protected onDispose() {}

    public init(data?: any) {
        this._disposing = false;
        this._sceneContext = this.registry.get("context") as Context;
        this.events.on("shutdown", this.dispose, this);
        this.events.on("destroy", this.dispose, this);
        this.scale.on("resize", this.onResizeHandler, this);
        this.scale.on("orientationchange", this.onOrientationChangeHandler, this);
        this.onInit(data);
    }

    public preload() {
        this.onPreload();
    }

    public create(data?: any) {
        this.onCreate(data);
    }

    public update(time: number, delta: number): void {
        this.onUpdate(time, delta);
    }
    
    private onOrientationChangeHandler(orientation: Phaser.Scale.Orientation) {
        this.onOrientationChange(orientation);
    }

    private onResizeHandler() {
        this.onResize();
    }

    private dispose() {
        if (this._disposing) {
            return;
        }
        
        this.scale.off("resize", this.onResizeHandler);
        this.scale.off("orientationchange", this.onOrientationChangeHandler);
        this.onDispose();
        this._disposing = true;
    }
}