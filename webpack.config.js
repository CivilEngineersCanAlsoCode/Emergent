// 🔹 WEBPACK CONFIGURATION FILE
// This file tells our build system how to convert TypeScript code into JavaScript
// that Chrome browsers can understand and execute as an extension

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 🔸 ENTRY POINTS: These are the main files that start our extension
  // Think of these as the "doors" into different parts of our extension
  entry: {
    // Background script: runs invisibly in the background, managing extension lifecycle
    background: './src/background.ts',
    // Content script: runs on job websites to interact with their pages
    content: './src/content.ts',
    // Popup script: controls the small window that opens when you click the extension icon
    popup: './src/popup.ts'
  },

  // 🔸 MODULE RULES: Instructions for processing different file types
  module: {
    rules: [
      {
        // Process TypeScript files (.ts): Convert them to JavaScript
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        // Process CSS files: Apply styling to our extension's interface
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  // 🔸 RESOLVE: Tell webpack what file extensions to recognize
  resolve: {
    extensions: ['.ts', '.js']
  },

  // 🔸 OUTPUT: Where to put the compiled files
  output: {
    // Put all compiled files in the 'dist' directory
    path: path.resolve(__dirname, 'dist'),
    // Clean the output directory before each build (removes old files)
    clean: true
  },

  // 🔸 PLUGINS: Additional tools that enhance the build process
  plugins: [
    // Copy static files (like icons, manifest) to the output directory
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'icons', to: 'icons' }
      ]
    }),
    
    // Generate the popup HTML file and link it to the popup JavaScript
    new HtmlWebpackPlugin({
      template: './src/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    })
  ]
};