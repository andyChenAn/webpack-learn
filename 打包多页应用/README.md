# 打包多页应用
对于存在多个入口文件，我们也可以使用webpack来打包，其实就是说有多少个入口文件，我们就生成多少个页面。

首先我们的项目的目录结构如下：

![目录](https://github.com/andyChenAn/webpack-learn/raw/master/打包多页应用/image/1.png)

该目录结构是每个页面都有一个单独的目录，并且目录里面包括了该页面需要用到的js文件，css文件，以及html模板文件，还有一个是common目录，里面包含了一些公共部分。

通过文档，我们都知道，webpack的entry属性可以是一个对象来处理多入口文件的打包，但是如果入口文件太多，我们也不可能一个一个的去添加，如果有什么方式可以让我们每次创建一个入口文件的时候，自动的把它添加到webpack的entry属性中就好了，其实我们可以定义一个方法，来查找指定目录下的所有的入口文件

```
const path = require('path');
const glob = require('glob');
/**
 * 查找入口文件函数
 */
function findEntry (_path) {
    let files = glob.sync(_path);
    let keys = [] , values = [] , entryObject = {};
    files.map((file , index) => {
        keys.push(file.split('/')[2]);
        values.push(file);
    });
    keys.map((key , index) => {
        entryObject[key] = values[index];
    });
    return entryObject;
};
exports.findEntry = findEntry
```

除此之外，我们还要根据入口文件的数量，来自动生成html文件，我们同样也可以创建一个函数，用来自动生成html文件：
```
/**
 * 自动生成html文件函数
 */
function createHtml (_path , HtmlWebpackPlugin) {
    let entryObject = findEntry(_path);
    let plugins = [];
    for (let key in entryObject) {
        plugins.push(new HtmlWebpackPlugin({
            title : key,
            template : `./src/${key}/${key}.html`,
            filename : `${key}.html`,
            chunks : [`${key}`]
        }))
    };
    return plugins;
};
```

其实，我这里创建了一个util.js的文件：
```
const path = require('path');
const glob = require('glob');
/**
 * 查找入口文件函数
 */
function findEntry (_path) {
    let files = glob.sync(_path);
    let keys = [] , values = [] , entryObject = {};
    files.map((file , index) => {
        keys.push(file.split('/')[2]);
        values.push(file);
    });
    keys.map((key , index) => {
        entryObject[key] = values[index];
    });
    return entryObject;
};

/**
 * 自动生成html文件函数
 */
function createHtml (_path , HtmlWebpackPlugin) {
    let entryObject = findEntry(_path);
    let plugins = [];
    for (let key in entryObject) {
        plugins.push(new HtmlWebpackPlugin({
            title : key,
            template : `./src/${key}/${key}.html`,
            filename : `${key}.html`,
            chunks : [`${key}`]
        }))
    };
    return plugins;
};

exports.findEntry = findEntry;
exports.createHtml = createHtml;
```
我们在来写webpack.config.js文件
```
// webpack.config.js文件
const path = require('path');
const util = require('./util.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : util.findEntry('./src/*/*.js'),
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : '[name]/js/[name].[hash:6].js',
        publicPath : '/'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.js$/,
                use : 'babel-loader'
            },
            {
                test : /\.css/,
                use : ExtractTextPlugin.extract({
                    use : ['css-loader?minimize']
                })
            },
            {
                test : /\.scss$/,
                use : ExtractTextPlugin.extract({
                    use : ['css-loader?minimize' , 'sass-loader']
                })
            },
            {
                test : /\.(png|jpe?g|gif)$/,
                use : {
                    loader : 'url-loader',
                    options : {
                        limit : 5120,
                        fallback : 'file-loader'
                    }
                }
            }
        ]
    },
    plugins : util.createHtml('./src/*/*.js' , HtmlWebpackPlugin)
    .concat([
        new ExtractTextPlugin({
            filename : '[name]/css/[name].[contenthash:6].css'
        })
    ]),
    devtool : 'eval-source-map'
}
```
### 用法
通过："npm install"来安装所有依赖，然后执行npm run dev命令即可。

打包后的项目目录结构如下：

![目录2](https://github.com/andyChenAn/webpack-learn/raw/master/打包多页应用/image/2.png)