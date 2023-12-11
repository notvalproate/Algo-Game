class AlgoCard {
    constructor (num_arg, color_arg) {
        this.number = num_arg
        this.color = color_arg
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

function ObjectArray_to_AlgoCardArray(arr) {
    for(var i = 0; i < arr.length; i++) {
        arr[i] = new AlgoCard(arr[i].number, arr[i].color);
    }
    return arr;
}

export {
    AlgoCard,
    ObjectArray_to_AlgoCardArray,
}