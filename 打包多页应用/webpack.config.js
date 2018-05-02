const path = require('path');
const util = require('./util.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : util.findEntry('./src/*/*.js'),
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : '[name]/js/[name].[hash:6].js',
        publicPath : '/'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.js$/,
                use : 'babel-loader'
            },
            {
                test : /\.css/,
                use : ExtractTextPlugin.extract({
                    use : ['css-loader?minimize']
                })
            },
            {
                test : /\.scss$/,
                use : ExtractTextPlugin.extract({
                    use : ['css-loader?minimize' , 'sass-loader']
                })
            },
            {
                test : /\.(png|jpe?g|gif)$/,
                use : {
                    loader : 'url-loader',
                    options : {
                        limit : 5120,
                        fallback : 'file-loader'
                    }
                }
            }
        ]
    },
    plugins : util.createHtml('./src/*/*.js' , HtmlWebpackPlugin)
    .concat([
        new ExtractTextPlugin({
            filename : '[name]/css/[name].[contenthash:6].css'
        })
    ]),
    devtool : 'eval-source-map'
}