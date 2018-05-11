const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
module.exports = {
    entry : {
        app : './app.js'
    },
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : '[name].js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.js$/,
                use : 'happypack/loader?id=babel',
                exclude : path.resolve(__dirname , 'node_modules')
            },
            {
                test : /\.css$/,
                use : ExtractTextPlugin.extract({
                    use : 'happypack/loader?id=css'
                })
            }
        ]
    },
    plugins : [
        new HappyPack({
            id : 'babel',
            loaders : ['babel-loader?cacheDirectory']
        }),
        new HappyPack({
            id : 'css',
            loaders : ['css-loader']
        }),
        new ExtractTextPlugin({
            filename : '[name].css'
        })
    ]
}