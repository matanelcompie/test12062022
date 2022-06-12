const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

var config = {
    mode: 'production',
    entry: './main.js',

    output: {
        path: path.resolve(__dirname, '../'),
        filename: './public/js/mobile.js',
    },

    devServer: {
        inline: true,
        port: 3000,
        historyApiFallback: true,
        contentBase: path.join(__dirname, "public"),
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',

                query: {
                    presets: ['env', 'react', 'stage-2']
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production')
          }
        }),
    ],
    optimization: {
        minimize: true
    },
    resolve: {
        modules: [
            path.resolve('./'),
            path.resolve('./node_modules')
          ]
    }
}

module.exports = config;