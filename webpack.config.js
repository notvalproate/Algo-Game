const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: [
        "./public/js/play.js"
    ],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
          {
            test: /\.css$/,
            exclude: /node_modules/,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [new TerserPlugin(), new MiniCssExtractPlugin()],
};