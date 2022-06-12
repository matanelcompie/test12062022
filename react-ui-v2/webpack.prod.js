const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Dotenv = require('dotenv-webpack');

var config = {
    entry: './main.js',

    output: {
        path: '../public/',
        filename: 'js/index.js',
    },
    devtool: "cheap-module-source-map",
    devServer: {
        inline: true,
        port: 8080,
        historyApiFallback: true
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',

                query: {
                    presets: ['es2015', 'react', 'stage-2']
                }
            },
            { test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css!sass') },
            { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") },
            {
                test: /\.(svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader',
                query: {
                    publicPath: '../',
                    name: 'Images/[name].[ext]'
                }
            },
            {
                test: /\.(ttf|eot|otf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader',
                query: {
                    publicPath: '../',
                    name: 'fonts/[name].[ext]'
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
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin("css/compiled.css"),
        new Dotenv({
            path: '../.env'
        })
    ],
    resolve: {
        root: [
            path.resolve('./')
        ]
    },
    node: { //Added to solve require of node server side specific libraries
        fs: 'empty', 
        child_process: 'empty' 
    },
}
module.exports = config;