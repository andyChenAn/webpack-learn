const path = require('path');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
module.exports = {
    entry : {
        app : './app.js'
    },
    output : {
        filename : '[name].js',
        path : path.resolve(__dirname , 'dist')
    },
    module : {
        rules : [
            {
                test : /\.js$/,
                use : {
                    loader : 'babel-loader',
                    options : {
                        presets : ['react']
                    }
                },
                exclude : path.resolve(__dirname , 'node_modules')
            }
        ]
    },
    plugins : [
        new DllReferencePlugin({
            manifest : require('./dist/react.manifest.json')
        }),
        new DllReferencePlugin({
            manifest : require('./dist/pollfill.manifest.json')
        })
    ],
    devtool : 'source-map',
    mode : 'development',
    resolve : {
        alias : {
            'react' : 'react/dist/react.js'
        }
    }
}