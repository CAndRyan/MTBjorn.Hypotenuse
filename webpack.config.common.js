const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.js',
        ui: './src/ui.js',
        data: './src/data.js',
        utility: './src/utility.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'hypotenuse',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.mjs'],
    },
    module: {
        rules: [
            {
                test: /\.m?jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
