const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.js',
        ui: './src/ui.js',
        data: './src/data.js',
        utility: './src/utility.js',
        build: './src/build.js'
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
            src: path.resolve(__dirname, 'src')
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
