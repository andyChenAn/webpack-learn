# devServer（本地开发）
我们在使用webpack构建应用的时候，可以通过devServer选项来构建本地应用。
```
const author = {
    name : 'andy',
    age : 20
};
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    devServer : {
        contentBase : path.resolve(__dirname , 'dist'),
        port : 8080
    },
    module : {
        rules : [
            {
                test : /\.ejs$/,
                loader : 'ejs-loader'
            }
        ] 
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : 'devServer本地开发',
            filename : 'demo.html',
            template : './template/demo.ejs',
            author : author
        })
    ]
};
```
```
// ./template/demo.ejs
// 我们可以通过html-webpack-plugin插件来让webpack自动生成html文件
// 可以通过插件的template选项来指定生成html文件需要用到的模板，我们这里使用了ejs模板，所以在模块解析的时候我们需要使用ejs-loader来解析ejs模板
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><%= htmlWebpackPlugin.options.title %></title>
</head>
<body>
    <h1>my name is <%= htmlWebpackPlugin.options.author.name %></h1>
</body>
</html>
```
上面的代码就是一个很简单的本地应用，当我们打开浏览器输入localhost:8080/demo.html时，就可以看到对应的页面。

这里需要注意的是，当我们使用webpack-dev-server命令打包文件时，打包的文件并不会显示出来，而是被保存在内存里，我们是看不到的。

通过设置devServer选项的proxy字段，可以实现代理服务器的功能，比如说，当我们在本地服务器访问localhost:8080/api/andy时，可以代理到localhost:3000/api/andy上，比如：
```
const author = {
    name : 'andy',
    age : 20
};
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    devServer : {
        contentBase : path.resolve(__dirname , 'dist'),
        port : 8080,
        after : function (app) {
            app.get('/andy' , function (req , res) {
                res.json({
                    name : 'andy'
                })
            })
        },
        proxy : {
            '/api' : 'http://localhost:3000'
        }
    }, 
    module : {
        rules : [
            {
                test : /\.ejs$/,
                loader : 'ejs-loader'
            }
        ] 
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : 'devServer本地开发',
            filename : 'demo.html',
            template : './template/demo.ejs',
            author : author
        })
    ]
};
```
```
// local.js   另一个服务器
const express = require('express');
const app = express();

app.get('/api/:id' , function (req , res) {
    res.json({
        name : 'andychen'
    })
});

app.listen(3000 , function () {
    console.log('listening port 3000');
})
```
所以当我们在localhost:8080上访问api/andy时，就会代理到localhost:3000上面。

其实这个devServer的选项是比较多的，我也只是学了一些比较常用的，其他的可以在日后的项目中有遇到再去学习，常用的选项有：
- port
- host
- contentBase
- proxy
- hot
- publicPath

这里我们做一个简单的单页应用打包，主要是对css，图片打包，比如：

```
const author = {
    name : 'andy',
    age : 20
};
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    devServer : {
        contentBase : path.resolve(__dirname , 'dist'),
        port : 8080,
        proxy : {
            '/api' : 'http://localhost:3000'
        },
        publicPath : '/dist/'        //   浏览器访问的打包的资源，比如说dist下的图片，dist下的bundle.js
    }, 
    module : {
        rules : [
            {
                test : /\.ejs$/,
                use : 'ejs-loader'
            },
            {
                test : /\.scss$/,
                use : ['style-loader' , 'css-loader' , 'sass-loader']
            },
            {
                test : /\.(png|jpg)$/,
                use : {
                    loader : 'url-loader',
                    options : {
                        limit : 5000,
                        fallback : 'file-loader'
                    }
                }
            }
        ] 
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : 'devServer本地开发',
            filename : 'demo.html',
            template : './template/demo.ejs',
            author : author
        })
    ]
};
```