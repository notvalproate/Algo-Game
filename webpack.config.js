const path = require('path');
module.exports = {
    mode: 'production',
    entry: [
        "./public/js/play.js"
    ],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: { 
        minimize: true 
    },
};