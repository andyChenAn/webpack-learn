const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
module.exports = {
    entry : {
        app : './app.js'
    },
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : '[name].js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.js$/,
                use : 'babel-loader',
                exclude : /node_modules/
            },
            {
                test : /\.scss$/,
                use : ExtractTextPlugin.extract({
                    use : ['css-loader?minimize' , 'sass-loader']
                })
            },
            {
                test : /\.css$/,
                use : ExtractTextPlugin.extract({
                    use : ['css-loader?minimize']
                })
            }
        ]
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : '打包单页应用',
            filename : 'index.html',
            template : './template.html'
        }),
        new ExtractTextPlugin('[name]_[contenthash:6].css')
    ]
};