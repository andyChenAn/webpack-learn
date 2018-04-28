const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
module.exports = {
    entry : './src/app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'build.js',
        publicPath : '/'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.vue$/,
                loader : 'vue-loader',
                options : {
                    extractCSS : true
                }
            },
            {
                test : /\.js$/,
                use : 'babel-loader'
            }
        ]
    },
    resolve : {
        alias : {
            'vue$' : 'vue/dist/vue.esm.js'
        }
    },
    optimization : {
        splitChunks : {
            name : 'commons',
            chunks : 'all',
            minChunks : 1
        }
    },
    devtool : 'cheap-eval-source-map',
    plugins : [
        new ExtractTextPlugin('style.css'),
        new HtmlWebpackPlugin({
            title : '打包vue应用',
            filename : 'index.html',
            template : 'index.html',
            inject : true
        }),
        new OpenBrowserPlugin({
            url : 'http://localhost:8080'
        })
    ]
};