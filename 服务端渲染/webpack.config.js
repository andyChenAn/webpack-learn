const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry : './main_server.js',
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : 'bundle_server.js',
        libraryTarget : 'commonjs2'
    },
    target : 'node',
    externals : [nodeExternals()],
    module : {
        rules : [
            {
                test : /\.js$/,
                use : 'babel-loader',
                exclude : /node_modules/
            },
            {
                test : /\.css$/,
                use : 'ignore-loader'
            },
            {
                test : /\.vue$/,
                loader : 'vue-loader',
                options : {
                    extractCSS : true
                }
            }
        ]
    },
    devtool : 'source-map',
    resolve : {
        alias : {
            'vue$' : 'vue/dist/vue.esm.js'
        }
    },
    mode : 'development',
    plugins : [
        new ExtractTextPlugin('style.css')
    ]
};