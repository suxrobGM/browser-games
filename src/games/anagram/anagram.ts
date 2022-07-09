import { Utils } from "phaser";

export class Anagram {
    public static async getRandomWordAsync(wordLength: number): Promise<string> {
        const response = await fetch("assets/anagram/words.json");
        const jsonData = await response.json();
        const words = (jsonData.words as string[]);
        const filteredWords = words.filter(i => i.length === wordLength);
        return Utils.Array.GetRandom(filteredWords) as string;
    }

    public static check(word1: string, word2: string): boolean {
        word1 = word1.replace(/[^\w]/g, "").toLowerCase()
        word2 = word2.replace(/[^\w]/g, "").toLowerCase()

        const charMapA = this.getCharMap(word1)
        const charMapB = this.getCharMap(word2)

        for (const char in charMapA) {
            if (charMapA[char] !== charMapB[char]) {
                return false
            }
        }

        return true
    }

    public static shuffle(word: string, replaceLastChar = false): string {
        const englishChars = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
        ];
        const charsArr = Array.from(word);
        Utils.Array.Shuffle(charsArr);
        
        if (replaceLastChar) {
            const randChar = Utils.Array.GetRandom(englishChars) as string;
            charsArr[charsArr.length - 1] = randChar;
        }
        
        return charsArr.join('');
    }

    private static getCharMap(str: string) {
        const charMap = {}
        for (const char of str) {
            charMap[char] = charMap[char] + 1 || 1
        }
        return charMap
    }
}