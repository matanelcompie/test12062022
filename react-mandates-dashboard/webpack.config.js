const path = require('path');
module.exports = {
   // define entry file and output
   entry: './src/index.js',
   output: {
       path: path.resolve('../public/js'),
       filename: 'mandates-dashboard.js'
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
           {  test: /\.(js|jsx)$/, loader: 'babel-loader', exclude: /node_modules/ },
           { test: /\.tsx?$/, loader: 'ts-loader' },
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
