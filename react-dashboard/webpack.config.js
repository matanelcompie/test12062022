const path = require('path');
module.exports = {
   // define entry file and output
   //the main file that webpack start
   entry: './src/index.js',
   
   output: {
        // folder to insert the compile file in public
       path: path.resolve('../public/js'),
       //file name of compile file
       filename: 'quarters-dashboard.js'
   },
   devServer: {
    writeToDisk: true,
    inline: false,
    historyApiFallback: true,
   disableHostCheck: true,

  },
  
   // define babel loader
   module: {
     //rules that compile  css/jsx on compile time 
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
