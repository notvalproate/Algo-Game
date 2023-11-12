class Pair {
    constructor(first=undefined, second=undefined) {
        this.first = first;
        this.second = second;
    }

    get first() {
        return this.first;
    }

    get second() {
        return this.second;
    }

    set first(new_value) {
        this.first = new_value;
    }

    set second(new_value) {
        this.second = new_value;
    }

    set unfilled(new_value) {
        if (this.first === undefined) {
            this.first = new_value;
        } else if (this.second === undefined) {
            this.second = new_value;
        } else {
            throw "Pair is already filled";
        }
    }

    isFilled() {
        return this.first !== undefined && this.second !== undefined;
    }
};

module.exports = Pair;