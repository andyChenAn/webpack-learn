# 打包单页应用
这里主要打包的是单入口文件的应用。一般来说，一个简单的页面主要包括的就是css文件，js文件，html文件等，所以我们只要处理好这几类文件就可以了。

- 我们可以使用style-loader , css-loader , sass-loader等来打包css文件或scss文件，可以使用extract-text-webpack-plugin插件来将css代码抽离出来，webpack4之后，建议使用mini-css-extract-plugin插件来抽离css代码。
- 使用babel-loader来打包js代码，主要作用是将es6转换为es5。
- 使用Html-webpack-plugin插件来自动生成html文件。

通过上面的三个步骤，基本上就可以完成一个简单的单页应用打包了。

### 具体代码

```
webpack.config.js文件
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
```
打包后的代码是这样的：

![打包后的文件](https://github.com/andyChenAn/webpack-learn/raw/master/打包单页应用/image/1.png)