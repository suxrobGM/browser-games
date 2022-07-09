# 2D Games
HTML5 2D games built up with PhaserJS framework. All games have time limit, dynamic level changing and score features. All games are highly customizable and adapt to mobile and desktop screen sizes. 

## How to run ?
1. Install npm dependencies:
```
$ npm install
```

2. Run development mode:

```
$ npm run dev
```

3. Open the http://localhost:10001/games.html and select a game from the list.

## Sample games
Click [here](https://suxrobgm.github.io/browser-games/dist/games.html) to open deployed games.
- "Anagram" - find the correct combination of shuffled words from given options.
![Anagram](./docs/anagram.gif)

- "Double" - find the pair of same sprites from separated rectangles.
![Double](./docs/double.gif)

- "Bug Sequence" - select the correct sequence of "bugs" from given grid.
![Bug Sequence](./docs/bug-sequence.gif)

- "Colors" - choose the words whose appropriate color corresponds to its name. 
![Colors](./docs/colors.gif)

- "Memo" - memorize the order of cards then choose the correct pairs from flipped cards.
![Memo](./docs/memo.gif)

## How to add a new game ?
To add a new game, you need to take a few required steps:
1. Create game's folder into `src/games` folder.
2. Create game's bootrapper (inherit from `BootstrapperBase` class).
3. Register scenes and levels by overriding `BootstrapperBase` methods:
    * `registerLevels()` - register game levels by calling `addLevel()`.
    * `registerScenes()` - register scenes with their key and scene type by calling `addScene(key, sceneType)` method.
    * `getStartupScene()` - specify the key name of the startup scene.
4. Create a new instance of your game's bootstrapper in `gamesList.ts` file.

If your game has assets then you have to update the `rollup.config.dist.js` and `rollup.config.dev.js` file.