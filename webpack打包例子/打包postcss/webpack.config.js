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
                test : /\.js$/,
                use : 'babel-loader',
                exclude : /node_modules/
            },
            {
                test : /\.css$/,
                use : ['style-loader' , 'css-loader' , {
                    loader : 'postcss-loader',
                    options : {
                        // 这里其实可以创建一个postcss.config.js文件来配置postcss-loader需要使用到的插件
                        plugins : [
                            require('precss'),
                            require('autoprefixer')
                        ]
                    }
                }]
            }
        ]
    }
};