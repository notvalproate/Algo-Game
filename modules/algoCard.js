class AlgoCard {
    constructor (color) {
        this.number = this.generateRandomNumber(0, 11);
        this.color = color;
        // color = "black" or "white"
    }

    getColor () {
        return this.color;
    }

    getNumber () {
        return this.number;
    }

    setNumber(number) {
        this.number = number;
    }

    setColor(color) {
        this.color = color;
    }

    generateRandomNumber (min=0, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    isCorrectGuess(guess) {
        return guess === this.number;
    }
}

// Shuffle a Deck of AlgoCards
function shuffle(deck) {
	for(var i = deck.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * i);
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	
	return deck;
}

// Get Shuffled Deck of said number of AlgoCards
function getShuffledDeck(numberOfCards) {

    deck = [];

    for(var i = 0; i < numberOfCards/2; i++) {
        var card = new AlgoCard("black");
        deck.push(card);
    }

    for(var i = 0; i < numberOfCards/2; i++) {
        var card = new AlgoCard("white");
        deck.push(card);
    }

    return shuffle(deck);
}

// Deal a said number of AlgoCards from the Deck
function dealCards(deck, numberOfCards) {
	indices = [];
	for(var i = 0; i < numberOfCards; i++) {
		j = Math.floor(Math.random() * numberOfCards);
		
		while (indices.includes(j)) {
			j = Math.floor(Math.random() * numberOfCards);
		}
		
		indices[i] = j;
	}
	
	dealtSet = []
	for(var i = 0; i < numberOfCards; i++) {
		dealtSet.push(deck[indices[i]]);
	}
	
	return dealtSet;
}

module.exports = {
    AlgoCard: AlgoCard,
    dealCards: dealCards,
    shuffle: shuffle,
    getShuffledDeck: getShuffledDeck
}