const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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
        globalObject: 'this',
        publicPath: ''
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.mjs'],
        alias: {
            build: path.resolve(__dirname, 'build/')
        }
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
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
};
