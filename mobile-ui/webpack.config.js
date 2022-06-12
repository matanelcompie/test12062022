const path = require('path');

var config = {
    mode: 'development',
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
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',

                query: {
                    presets: ['env', 'react', 'stage-2']
                }
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve('./'),
            path.resolve('./node_modules')
          ]
    }
}

module.exports = config;