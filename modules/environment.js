require("dotenv").config();

const env = {
    app: {
        MODE: process.env.MODE,
        PORT: process.env.MODE === 'development' ? process.env.PORT || 58617 : 443,
    },
}

module.exports = env;