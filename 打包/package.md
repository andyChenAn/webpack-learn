# 打包
webpack就是一个打包工具，对于前端开发来说，一般我们需要打包的就是css，js，图片，字体图标等。

#### 打包css
打包css，一般我们会打包css文件，sass文件，less文件，postcss等，我们来看个例子：

```
// webpack.config.js
const path = require('path');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'js/app.bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.css$/,
                use : ExtractTextWebpackPlugin.extract({
                    use : 'css-loader',
                    fallback : 'style-loader'
                })
            },
            {
                test : /\.scss$/,
                use : ExtractTextWebpackPlugin.extract({
                    use : ['css-loader' , 'sass-loader']
                })
            }
        ]
    },
    plugins : [
        new ExtractTextWebpackPlugin('style.css'),
        new HtmlWebpackPlugin({
            title : '打包css',
            filename : 'demo.html',
            inject : 'body'
        })
    ]
}
```

```
// app.js
import './css/index.scss';
require('./css/app.css');
const box = document.createElement('div');
box.innerHTML = 'hello adhyche';
box.setAttribute('class' , 'app');
document.body.appendChild(box);

```
主要还是通过extract-text-webpack-plugin插件来将引入的css文件抽离出来到一个单独的css文件中。
#### 打包图片
```
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.(png|jpg|jpeg)$/,
                use : {
                    loader : 'file-loader',
                    options : {
                        name : './images/[hash].[ext]'
                    }
                }
            },
            {
                test : /\.scss$/,
                use : ['style-loader', 'css-loader' , 'sass-loader']
            }
        ]
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : '打包图片',
            filename : 'demo.html'
        })
    ]
}
```

```
// app.js
require('./css/index.scss');
let img = document.createElement('img');
let imgSrc = require('./hotel.png');
img.src = imgSrc;
document.body.appendChild(img);
```

```
// index.scss
$blue : #f00;
body {
    background-color: $blue;
    background: url('../stream.png') no-repeat center center;
}
```
通过file-loader加载器，可以将打包图片，我们注意这种是通过require或者import的方式来引入图片，如果直接img.src = 'xxx.png'，并不能打包图片。

除了使用file-loader来加载图片路径之外，我们也可以使用url-loader来加载图片路径，它们的主要区别在于，url-loader是将加载的小图片转为base64格式的图片。比如：
```
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.(png|jpg|jpeg)$/,
                use : {
                    loader : 'url-loader',
                    options : {
                        limit : 5000
                    }
                }
            },
            {
                test : /\.scss$/,
                use : ['style-loader', 'css-loader' , 'sass-loader']
            }
        ]
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : '打包图片',
            filename : 'demo.html'
        })
    ]
}
```

```
// app.js
require('./css/index.scss');
let div = document.createElement('div');
div.id = 'box';
document.body.appendChild(div);
```
```
// index.scss
$blue : #f00;
body {
    background-color: $blue;
    background: url('../stream.png') no-repeat center center;
}
#box {
    background: url('../hotel.png') no-repeat center center;
    width: 100px;
    height: 100px;
}
```
我们也可以结合file-loader和url-loader一起使用，比如：

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.(png|jpg|jpeg)$/,
                use : [
                    {
                        loader : 'url-loader',
                        options : {
                            limit : 5000,
                            // 如果不满足条件的话，我们就使用file-loader来加载图片
                            fallback : 'file-loader'
                        }
                    }
                ]
            },
            {
                test : /\.scss$/,
                use : ['style-loader', 'css-loader' , 'sass-loader']
            }
        ]
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : '打包图片',
            filename : 'demo.html'
        })
    ]
}
```
#### 打包字体图标
我们会经常用到一些字体图标，我们通过url-loader来打包
```
const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
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
                test : /\.css$/,
                use : ['style-loader' , 'css-loader']
            },
        ]
    }
}
```