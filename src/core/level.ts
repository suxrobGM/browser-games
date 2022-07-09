/* eslint-disable @typescript-eslint/no-explicit-any */
export class Level {
    public value: number;
    public awardPoints: number;
    public chargePoints: number;
    public minPoints: number;
    public nextLevelTreshold: number;
    public data: any;

    constructor(value: number, config?: LevelConfig) {
        config = getValidConfig(config);
        this.value = value;
        this.awardPoints = config.awardPoints;
        this.chargePoints = config.chargePoints;
        this.minPoints = config.minPoints;
        this.nextLevelTreshold = config.nextLevelTreshold;
        this.data = config.data;
    }

    public static async loadLevelsAsync(jsonUrl: string): Promise<Level[]> {
        const response = await fetch(jsonUrl);
        const jsonData = await response.json();
        return jsonData.levels as Level[];
    }
}

export type LevelConfig = {
    awardPoints?: number;
    chargePoints?: number;
    minPoints?: number;
    nextLevelTreshold?: number;
    data?: any;
}

function getValidConfig(config: LevelConfig): LevelConfig {
    if (config === undefined) {
        config = {
            awardPoints: 100,
            chargePoints: 5,
            minPoints: 20,
            nextLevelTreshold: 100,
        }

        return config;
    }

    if (!config.awardPoints) {
        config.awardPoints = 100;
    }

    if (!config.chargePoints) {
        config.chargePoints = 5;
    }

    if (!config.minPoints) {
        config.minPoints = 20;
    }

    if (!config.nextLevelTreshold) {
        config.nextLevelTreshold = 100;
    }

    return config;
}