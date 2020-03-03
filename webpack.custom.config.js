console.log('hola webpack!');
const path = require('path');

module.exports = {
  devServer: {
    //contentBase: path.join(__dirname, 'dist'),
    contentBase: path.join(__dirname, 'www'),
    before: app => {
      // Configure manifest.json CORS headers.
      app.get('/manifest.json', (req, res, next) => {
        
        res.set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        });
        //res.headers('Access-Control-Allow-Origin', '*');
        console.log('res => ', res);
        next();
      })
    }
  },
};

const webpack = require('webpack');

const API_URL = process.env.API_URL || 'http://localhost/';

// https://codeburst.io/customizing-angular-cli-6-build-an-alternative-to-ng-eject-a48304cd3b21
// module.exports = {
//   plugins: [
//     new webpack.DefinePlugin({
//       'process.env.API_URL': JSON.stringify(API_URL)
//     }),
//   ],
//   resolve: {
//     alias: {
//       "crypto": "crypto-browserify"
//     }
//   },
//   node: {
//     vm: true,
//     stream: true
//   }
// };

// module.exports = {
  
// };

