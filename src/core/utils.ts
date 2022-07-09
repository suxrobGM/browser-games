/**
 * Math utils class
 */
export class MathUtils {
    /**
     * Generates a random intger value in the range max and min.
     * @param min Min integer
     * @param max Max integer
     * @returns A random integer 
     */
    static getRandom(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

/**
 * Thread utils class
 */
export class ThreadUtils {
    /**
         * Sleeps current thread
         * @param ms Milliseconds to sleep current thread
         * @returns Promise
         */
    static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Waits until condtion becomes true
     * @param condition Condition to sleep current thread
     * @returns Promise
     */
    static async waitUntil(condition: () => boolean) {
        while (condition() === false) {
            await this.sleep(50);
        }
    }
}

export class ArrayUtils {
    /**
     * Removes an item from the array.
     * @param item item
     * @param array array
     */
    static removeFromArray<T>(item: T, array: Array<T>) {
        const index = array.indexOf(item);
        array.splice(index, 1);
    }

    static getRandomItem<T>(array: Array<T>): T {
        const randIndex = MathUtils.getRandom(0, array.length - 1);
        const randObj = array[randIndex];
        return randObj;
    }
}

export class PageUtils {
    /**
     * Detects wether document rendered into iframe.
     * @returns True if document rendered inside iframe otherwise false.
     */
    public static isIframe(): boolean {
        return window !== window.parent;
    }

    /**
     * Detects wether page is opened in mobile browser.
     * @returns True if page is opened in mobile browser otherwise false.
     */
    public static isMobile(): boolean {
        return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(navigator.userAgent);
    }

    public static isIOS(): boolean {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    }
}