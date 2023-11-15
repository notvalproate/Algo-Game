class AlgoCard {
    constructor (color) {
        this.number = this.generateRandomNumber(0, 11);
        this.color = color;
        // color = "#000000ff" or "#ffffffff"
        // Storing color as [R, G, B, A] involves preprocessing before we add color in css. So HexString is more apt.
    }

    get color () {
        return this.color;
    }

    get number () {
        return this.number;
    }

    generateRandomNumber (min=0, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    isCorrectGuess(guess) {
        return guess === this.number;
    }
}

module.exports = AlgoCard;