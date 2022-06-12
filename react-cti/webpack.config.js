const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const config = {
    entry: './index.js',

    output: {
        path: path.resolve(__dirname, '../public/'),
        filename: 'js/cti.js',
    },
    devtool: "cheap-module-source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015', 'react', 'env', 'stage-2']
                    }
                }
            },
            {
                test: /\.css|\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    //resolve-url-loader may be chained before sass-loader if necessary
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
                test: /\.(svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader',
                query: {
                    publicPath: '../',
                    name: 'Images/[name].[ext]'
                }
            },
        ]
    },

    plugins: [
        new ExtractTextPlugin("css/cti.css")
    ],
    resolve: {
        modules: [
            path.join(__dirname, "./"),
            "node_modules"
        ]
    }

};

module.exports = config;
