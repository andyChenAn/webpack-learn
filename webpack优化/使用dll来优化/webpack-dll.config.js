const path = require('path');
const DllPlugin = require('webpack/lib/DllPlugin');
module.exports = {
    entry : {
        react : ['react' , 'react-dom'],
        pollfill : ['core-js/fn/object/assign' , 'core-js/fn/promise/index']
    },
    output : {
        filename : '[name].dll.js',
        path : path.resolve(__dirname , 'dist'),
        library : '_dll_[name]'
    },
    plugins : [
        new DllPlugin({
            name : '_dll_[name]',
            path : path.resolve(__dirname , 'dist/[name].manifest.json')
        })
    ],
    mode : 'development'
}