(function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gameId = urlParams.get("gameId");
    const playerId = urlParams.get("playerId");
    const sessionId = urlParams.get("sessionId");
    const rank = urlParams.get("rank");
    const highscore = urlParams.get("highscore");
    const level = urlParams.get("level");
    const timestamp = urlParams.get("timestamp");
    const signature = urlParams.get("signature");
    
    if (gameId) {
        window.initGame({
            gameId: gameId,
            playerId: playerId,
            sessionId: sessionId,
            rank: rank,
            highscore: highscore,
            level: level,
            timestamp: timestamp,
            signature: signature
        });
    }
})();