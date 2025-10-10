const path = require('path');

module.exports = {
  entry: './src/index.tsx', // Punto de entrada (lo crearemos en el siguiente paso)
  mode: 'development', // o 'production'
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'ts-loader'],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader', 
          'css-loader',
          'postcss-loader'
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'script.js', // ¡Nombre de archivo de salida!
    path: path.resolve(__dirname, './'), // Carpeta de salida (la carpeta 'js' existente)
  },
 
  watchOptions: {
    ignored: /node_modules/, // Ignora completamente la carpeta node_modules
    poll: 1000, // Comprueba si hay cambios cada 1000ms (1 segundo)
  },

     devServer: {
        static: './', 
        open: true, 
        port: 8080, 
  },

};