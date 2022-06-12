const path = require('path');
module.exports = {
   // define entry file and output
   entry: './src/index.js',
   output: {
       path: path.resolve('../public/js'),
       filename: 'activists-payments.js'
   },
   devServer: {
    writeToDisk: true,
    inline: false,
    historyApiFallback: true,
   disableHostCheck: true,

  },
  
   // define babel loader
   module: {
       rules: [
           { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
           {
            test: /\.scss|\.css$/,
              use: [{
                loader: "style-loader"
              }, {
                loader: "css-loader" 
              }, {
                loader: "sass-loader"
              }]
        }
       ]
   }
};
