# 打包react应用
### babel是什么？
babel是一个工具链，主要用于将ECMAScript 2015+代码转为在当前或者旧版本浏览器或环境中的向后兼容版本的JavaScript代码。babel主要可以为我们做以下几件事情：
- 转换语法。
- polyfill功能，主要是在你的目标环境中缺少的JavaScript新特性。
- 源代码转换。
### ES2015及以上版本
Babel通过语法转换已经支持最新的JavaScript版本，Babel的插件允许我们使用新的JavaScript语法，而不必等到浏览器支持的时候再使用。
### JSX和React
Babel可以转换JSX语法，我们可以使用babel-preset-react来实现JSX语法的转换。
### 类型注释（Flow和TypeScript）
Babel可以删除类型注释，我们可以通过使用@babel/preset-flow或者@babel/preset-typescript来删除类型注释。这里我们需要记住：Babel不做类型检查，所以我们仍然需要安装和使用Flow或者TypeScript去做类型检查。
### 用法
我这里使用的是babel7版本，以编译react应用为例，来看看具体该如何使用babel7。

```javascript
import React , { Component } from 'react';
import ReactDOM from 'react-dom';
class Hello extends Component {
    render () {
        return (
            <div>hello andy</div>
        )
    }
};
ReactDOM.render(<Hello /> , document.getElementById('app'));
```
.babelrc文件

```javascript
{
    "presets" : [
        ["@babel/preset-env" , {
            "targets" : {
                "browsers" : ["> 1%"]
            }
        }],
        "@babel/preset-react"
    ]
}
```
“@babel/preset-env”表示的是通过最新的js语法去编译js代码，“@babel/preset-react”表示的是编译JSX语法，presets选项的执行顺序是从后往前，也就是说代码会先进行JSX语法编译，然后交给@babel/preset-env来使用最新js语法编译。

**如果是babel6版本，那么可以不用安装@babel/core，@bable/preset-env，@babel/preset-react等，而是安装babel-core，babel-preset-env，babel-preset-react等**

### 编译过程中遇到的问题
```
Module build failed: Error: Requires Babel "^7.0.0-0", but was loaded with "6.26.3". 
```
遇到这个问题，主要是babel-loader下载的是6.26.3版本，而不是7以上版本，所以会包这样的错误，同时babel-core也要更新到7版本。

```
Module build failed: Error: Plugin/Preset files are not allowed to export objects, only functions. 
```
这个错误，主要是因为安装的@babel/preset-env版本不一样导致，将它们都更新到7版本就可以了。

最终的package.json文件：

```
"devDependencies": {
    "@babel/core": "^7.4.0",
    "@babel/preset-env": "^7.4.2",
    "@babel/preset-react": "^7.0.0",
    "babel-core": "^7.0.0-bridge.0",
    "babel-loader": "^7.1.5",
    "css-loader": "^2.1.1",
    "file-loader": "^3.0.1",
    "html-webpack-plugin": "^3.2.0",
    "less-loader": "^4.1.0",
    "postcss-loader": "^3.0.0",
    "sass-loader": "^7.1.0",
    "style-loader": "^0.23.1",
    "url-loader": "^1.1.2",
    "webpack-cli": "^3.3.0",
    "webpack-dev-server": "^3.2.1"
}
```
上面的babel系列到升级到7以上版本就可以了。

webpack.config.js文件：

```javascript
const path = require('path');
module.exports = {
    entry : './src/demo.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.js$/,
                use : {
                    loader : 'babel-loader'
                },
                exclude : /node_modules/
            }
        ]
    }
}
```
- 3、编译less文件时，需要安装less和less-loader，不然编译会报错

```
npm i less less-loader --save-dev
```
- 4、使用mini-css-extract-plugin插件分离css时，报错

```
/Users/andy/Desktop/andy-webpack/node_modules/mini-css-extract-plugin/dist/index.js:197
      compilation.hooks.contentHash.tap(pluginName, chunk => {
                                    ^
TypeError: Cannot read property 'tap' of undefined
```
主要是因为全局安装的webpack版本比较低导致，只要npm update webpack -g来升级webpack版本就可以了。

当我们可以通过mini-css-extract-plugin插件将js中的css分离出来，放到单独的css文件中，之后我们就需要对css文件进行压缩，可以使用"optimize-css-assets-webpack-plugin"插件来压缩。

```
npm i optimize-css-assets-webpack-plugin --save-dev
```
当我们按照完这个插件，然后执行webpack后，查看css代码，确实被压缩了，但是我们发现js代码却没有被压缩，所以我们这里也需要使用一个插件来压缩js代码。

如果是压缩js代码呢，我们可以使用"uglifyjs-webpack-plugin"插件

```
npm i uglifyjs-webpack-plugin --save-dev
```

如果我们要写css的兼容样式，根据浏览器的不同，有不同的前缀，如果我们自己一个一个的去加会比较麻烦，如果有专门的loader来帮我们，那就更好了，这里我们可以使用postcss-loader和autoprefixer来实现。

```
npm i postcss-loader autoprefixer --save-dev
```
除了安装这两个loader之外，我们还需要配置autoprefixer的browsers字段
```javascript
{
    test : /\.css$/,
    use : [
        devMode ? 'style-loader' : MiniCssExtractPlugin.loader
        , 'css-loader' , {
            loader : 'postcss-loader',
            options : {
                plugins : [
                    require('autoprefixer')({
                        browsers : [
                            "defaults",
                            "not ie < 7",
                            "last 2 versions",
                            "> 1%",
                            "iOS 7",
                            "last 3 iOS versions"
                        ]
                    })
                ]
            }
        }]
}
```
这样我们就可以看到css文件中已经自动添加了浏览器前缀。

package.json文件
```javascript
// package.json文件
process.env.NODE_ENV = 'production';
const devMode = process.env.NODE_ENV !== 'production';
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    entry : {
        app : './src/demo.js'
    },
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    optimization : {
        minimizer : [
            new OptimizeCssAssetsPlugin(),
            new UglifyjsWebpackPlugin()
        ]
    },
    mode : process.env.NODE_ENV,
    module : {
        rules : [
            {
                test : /\.jsx?$/,
                use : {
                    loader : 'babel-loader'
                },
                exclude : /node_modules/
            },
            {
                test : /\.less$/,
                use : ['style-loader' , 'css-loader' , 'less-loader']
            },
            {
                test : /\.css$/,
                use : [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader
                    , 'css-loader' , {
                        loader : 'postcss-loader',
                        options : {
                            plugins : [
                                require('autoprefixer')({
                                    browsers : [
                                        "defaults",
                                        "not ie < 7",
                                        "last 2 versions",
                                        "> 1%",
                                        "iOS 7",
                                        "last 3 iOS versions"
                                    ]
                                })
                            ]
                        }
                    }]
            }
        ]
    },
    plugins : [
        new MiniCssExtractPlugin({
            filename : '[name].css'
        })
    ]
}
```
