# 多页面应用打包
使用webpack，我们可以给单页面应用打包，也可以给多页面应用打包。我这里实现了一个简单的多页面应用打包：

整体项目目录结构如下：

![目录1](https://github.com/andyChenAn/webpack-learn/raw/master/多页应用打包/image/1.png)

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
console.log(path.resolve(__dirname , 'dist'))
module.exports = {
    entry : {
        home : './src/home/index.js',
        about : './src/about/index.js'
    },
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : '[name]/js/[name].[hash].js',
        publicPath : '/dist'
    },
    devServer : {
        port : 8080,
        contentBase : './'
    },
    mode : 'production',
    externals : {
        $ : 'jquery'
    },
    module : {
        rules : [
            {
                test : /\.css$/,
                use : ExtractTextPlugin.extract({
                    use : 'css-loader',
                    fallback : 'style-loader'
                })
            },
            {
                test : /\.scss$/,
                use : ['css-loader' , 'sass-loader']
            },
            {
                test : /\.(png|jpg|jpeg|gif)$/,
                use : {
                    loader : 'url-loader',
                    options : {
                        limit : 10000,
                        fallback : 'file-loader'
                    }
                }
            },
            {
                test : /\.(eot|svg|ttf|woff)$/,
                use : {
                    loader : 'url-loader',
                    options : {
                        limit : 5000
                    }
                }
            },
            {
                test : /\.ejs$/,
                use : 'ejs-loader'
            }
        ]
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : 'home页面',
            filename : 'home/home.html',
            template : './src/home/template/home.ejs',
            chunks : ['home']
        }),
        new HtmlWebpackPlugin({
            title : 'about页面',
            filename : 'about/about.html',
            template : './src/about/template/about.ejs',
            chunks : ['about']
        }),
        new ExtractTextPlugin('[name]/css/[name].[hash].css')
    ]
}
```
- 通过html-webpack-plugin插件来实现自动生成html文件，通过指定chunks选项来选择该html文件需要加载的js。
- 通过extract-text-webpack-plugin插件来实现提取css文件
- 将publicPath设置为"/dist"，表示浏览器加载打包后的文件是从dist目录下访问的

打包后的目录结构如下：

![目录2](https://github.com/andyChenAn/webpack-learn/raw/master/多页应用打包/image/2.png)

当我们执行webpack-dev-server命令时，可以直接在localhost:8080/dist/home/home.html打开页面，但是通过webpack命名打包后，直接点击html文件，加载不出js文件和css文件，显示的路径是下面这样：
```
<script type="text/javascript" src="/dist/about/js/about.5b627a1f64ce3746bd7a.js"></script>
<link href="/dist/about/css/about.5b627a1f64ce3746bd7a.css" rel="stylesheet">
```
不知道是对还是错，有点困惑。