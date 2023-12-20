class AlgoCard {
    constructor(num_arg, color_arg) {
        this.number = num_arg;
        this.color = color_arg;
    }

    getColor() {
        return this.color;
    }

    getNumber() {
        return this.number;
    }

    setNumber(number) {
        this.number = number;
    }

    setColor(color) {
        this.color = color;
    }

    generateRandomNumber(min = 0, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    isCorrectGuess(guess) {
        return guess === this.number;
    }
}

// Shuffle a Deck of AlgoCards
function shuffle(deck) {
    for (var i = deck.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * i);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

// Get Shuffled Deck of said number of AlgoCards
function getShuffledDeck(numberOfCards) {
    deck = [];

    for (var i = 0; i < numberOfCards / 2; i++) {
        var card = new AlgoCard(i, "black");
        deck.push(card);
    }

    for (var i = 0; i < numberOfCards / 2; i++) {
        var card = new AlgoCard(i, "white");
        deck.push(card);
    }

    return shuffle(deck);
}

function sortPlayerHand(hand) {
    hand.sort((a, b) => {
        if (a.getColor() !== b.getColor() && a.getNumber() === b.getNumber()) {
            if (a.getColor() === "black") {
                // a < b according to algo rules
                return -1;
            }
            // a > b according to algo rules
            return 1;
        }

        return a.getNumber() - b.getNumber();
    });
    return hand;
}

function removeNums(cards) {
    var retval = cards;
    for (i = 0; i < retval.length; i++) {
        retval[i].setNumber(null);
    }
    return retval;
}

function ObjectArray_to_AlgoCardArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = new AlgoCard(arr[i].number, arr[i].color);
    }
    return arr;
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

module.exports = {
    AlgoCard: AlgoCard,
    shuffle: shuffle,
    getShuffledDeck: getShuffledDeck,
    removeNums: removeNums,
    sortPlayerHand: sortPlayerHand,
    ObjectArray_to_AlgoCardArray: ObjectArray_to_AlgoCardArray,
    deepCopy: deepCopy,
};
