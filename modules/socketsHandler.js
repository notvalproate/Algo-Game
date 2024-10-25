const e = require("express");
const { removeNums } = require("./algoCard.js");
const { deepCopy } = require("./algoCard.js");
const { ObjectArray_to_AlgoCardArray } = require("./algoCard.js");

class SocketHandler {
    static init(io, roomsHandler) {
        SocketHandler.io = io;
        SocketHandler.roomsHandler = roomsHandler;
    }

    constructor(socket, username, roomKey) {
        this.socket = socket;
        this.username = username;
        this.roomKey = roomKey;
        this.room = undefined;
    }

    connectToGameRoom() {
        this.room = SocketHandler.roomsHandler.getRoom(this.roomKey);

        if (this.room !== undefined) { 
            if (this.room.users[0].username === this.username) {
                console.log("came hereeeee");
                return false;
            }
        }

        const roomWasCreated = SocketHandler.roomsHandler.connectToRoom(
            this.roomKey,
            this.username,
            this.socket
        );
        this.room = SocketHandler.roomsHandler.getRoom(this.roomKey);

        if (roomWasCreated) {
            logWithTime(`[+] Room [${this.roomKey}] was created!`);
        }

        this.socket.join(this.roomKey);
        logWithTime(
            `[+] User [${this.username}] connected to lobby [${this.roomKey}]`
        );

        return true;
    }

    disconnectSocket() {
        if (this.room.getGameRunning()) {
            const [winnerStats, loserStats] = this.room.getStats(this.username);
            loserStats.wins++;

            this.socket.broadcast
                .to(this.roomKey)
                .emit("gameEnded", {
                    wonGame: true,
                    enemyDisconnect: true,
                    stats: loserStats,
                });
            this.room.resetGame();

            logWithTime(`[-] Game ended in room [${this.roomKey}]!!!`);
        }

        const destroyed = SocketHandler.roomsHandler.disconnectFromRoom(
            this.username,
            this.roomKey
        );

        logWithTime(
            `[-] User [${this.username}] disconnected from lobby [${this.roomKey}]`
        );

        if (destroyed) {
            logWithTime(`[-] Room [${this.roomKey}] was destroyed!`);
        } else {
            this.emitReadyUpdate();
        }

        this.emitLobbyUpdate();
    }

    confirmReady(readyData) {
        const startGame = this.room.setReady(this.username, readyData.ready);

        this.emitReadyUpdate();

        if (startGame) {
            const [yourHand, enemyHand, yourTurn] = this.room.getGameSetup(
                this.username
            );
            var [hiddenDeckTop, visibleDeckTop] =
                this.room.getHiddenAndVisibleDeckTop();

            if (!yourTurn) {
                [hiddenDeckTop, visibleDeckTop] = [
                    visibleDeckTop,
                    hiddenDeckTop,
                ];
            }

            this.socket.emit("startGame", {
                yourHand: yourHand,
                enemyHand: removeNums(
                    ObjectArray_to_AlgoCardArray(deepCopy(enemyHand))
                ),
                yourTurn: yourTurn,
                deckTop: visibleDeckTop,
            });

            this.socket.broadcast.to(this.roomKey).emit("startGame", {
                yourHand: enemyHand,
                enemyHand: removeNums(
                    ObjectArray_to_AlgoCardArray(deepCopy(yourHand))
                ),
                yourTurn: !yourTurn,
                deckTop: hiddenDeckTop,
            });

            this.room.resetReadyStatus();
            logWithTime(`[+] Game started in room [${this.roomKey}]!!!`);
        }
    }

    updateSelection(data) {
        if (!this.room.getActiveTurn(this.username)) {
            return;
        }

        this.socket.broadcast
            .to(this.roomKey)
            .emit("highlightCard", {
                index: data.guessTarget,
                value: data.guessValue,
            });
    }

    updateButtonClicked(data) {
        if (!this.room.getActiveTurn(this.username)) {
            return;
        }

        this.socket.broadcast
            .to(this.roomKey)
            .emit("updateButtonValue", { buttonValue: data.buttonValue });
    }

    handleAttack(data) {
        if (!this.room.getActiveTurn(this.username)) {
            return;
        }

        const [guessWasCorrect, insertIndex, deckTopValue, wonGame] =
            this.room.makeGuess(data.guessTarget, data.guessValue);

        if (guessWasCorrect) {
            this.socket.emit("correctMove", {
                yourTurn: true,
                guessTarget: data.guessTarget,
            });
            this.socket.broadcast
                .to(this.roomKey)
                .emit("correctMove", {
                    yourTurn: false,
                    guessTarget: data.guessTarget,
                });

            if (wonGame) {
                const [winnerStats, loserStats] = this.room.getStats(
                    this.username
                );

                this.socket.emit("gameEnded", {
                    wonGame: true,
                    enemyDisconnect: false,
                    stats: winnerStats,
                });
                this.socket.broadcast
                    .to(this.roomKey)
                    .emit("gameEnded", {
                        wonGame: false,
                        enemyDisconnect: false,
                        stats: loserStats,
                    });
                this.room.resetGame();

                logWithTime(`[-] Game ended in room [${this.roomKey}]!!!`);
            }
        } else {
            const [hiddenDeckTop, visibleDeckTop] =
                this.room.getHiddenAndVisibleDeckTop();

            if (hiddenDeckTop === undefined) {
                const [currUserStats, otherUserStats] = this.room.getStats(
                    this.username
                );

                this.socket.emit("gameDraw", {
                    stats: currUserStats,
                    wasWrongGuess: true,
                });
                this.socket.broadcast
                    .to(this.roomKey)
                    .emit("gameDraw", {
                        stats: otherUserStats,
                        wasWrongGuess: true,
                    });

                this.room.resetGame();

                logWithTime(`[-] Game ended in room [${this.roomKey}]!!!`);
                return;
            }

            this.socket.emit("wrongMove", {
                yourTurn: false,
                value: deckTopValue,
                insertIndex: insertIndex,
                nextDeckTop: hiddenDeckTop,
            });

            this.socket.broadcast
                .to(this.roomKey)
                .emit("wrongMove", {
                    yourTurn: true,
                    value: deckTopValue,
                    insertIndex: insertIndex,
                    nextDeckTop: visibleDeckTop,
                });
        }
    }

    handleHold() {
        if (!this.room.getActiveTurn(this.username)) {
            return;
        }

        const insertIndex = this.room.holdDeckTop();
        const [hiddenDeckTop, visibleDeckTop] =
            this.room.getHiddenAndVisibleDeckTop();

        if (hiddenDeckTop === undefined) {
            const [currUserStats, otherUserStats] = this.room.getStats(
                this.username
            );

            this.socket.emit("gameDraw", {
                stats: currUserStats,
                wasWrongGuess: false,
            });
            this.socket.broadcast
                .to(this.roomKey)
                .emit("gameDraw", {
                    stats: otherUserStats,
                    wasWrongGuess: false,
                });

            this.room.resetGame();
            
            logWithTime(`[-] Game ended in room [${this.roomKey}]!!!`);
            return;
        }

        this.socket.emit("cardHeld", {
            yourTurn: false,
            insertIndex: insertIndex,
            nextDeckTop: hiddenDeckTop,
        });
        this.socket.broadcast
            .to(this.roomKey)
            .emit("cardHeld", {
                yourTurn: true,
                insertIndex: insertIndex,
                nextDeckTop: visibleDeckTop,
            });
    }

    // io Emits
    emitSameUsernameAlert() {
        this.socket.emit("sameUsernameAlert");
    }

    emitLobbyUpdate() {
        const userList = this.room.getUsers();
        let otherUser = null;
        if (userList.length === 2) {
            otherUser = userList[1].username;
        }
        SocketHandler.io
            .to(this.roomKey)
            .emit("lobbyUpdate", {
                usernames: [userList[0].username, otherUser],
            });
    }

    emitReadyUpdate() {
        SocketHandler.io
            .to(this.roomKey)
            .emit("readyUpdate", {
                userList: this.room.getUsers(),
                readyCount: this.room.getReadyCount(),
            });
    }
}

// Utility functions
function logWithTime(str) {
    const date = new Date();
    const dd = [date.getHours(), date.getMinutes(), date.getSeconds()].map(
        (a) => (a < 10 ? "0" + a : a)
    );
    console.log(`[${dd.join(":")}]${str}`);
}

// Exports
module.exports = SocketHandler;
