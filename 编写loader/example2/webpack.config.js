const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.html$/,
                loader : path.resolve(__dirname , './html-loader.js')
            }
        ]
    }
}