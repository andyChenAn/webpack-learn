# 服务端渲染
对于服务端渲染，也只是因为在学习vuejs的时候听过，但没有用过。可以理解为在服务器端渲染好html内容，然后浏览器在访问某个页面的时候将内容返回给客户端。这样的好处就是有利于SEO优化，以及提高页面加载速度。（难怪我们公司的页面基本上都是后端模板渲染出来的）

我这里采用vuejs+webpack+vue-server-renderer+express来进行服务端渲染

因为是服务器端渲染，那么代码的执行环境就是在nodejs，所以我们通过webpack打包的js文件必须服务commonjs的规范，首先我们来看一下如何将整个项目打包，项目的目录结构如下：

![目录1](https://github.com/andyChenAn/webpack-learn/raw/master/服务端渲染/image/1.png)

如图，结构很简单，毕竟只是为了学习webpack是如何打包服务端渲染文件的。

我们来编写webpack.config.js文件：
```
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
module.exports = {
    entry : './main_server.js',
    output : {
        path : path.resolve(__dirname , './dist'),
        filename : 'bundle_server.js',
        libraryTarget : 'commonjs2'
    },
    target : 'node',
    externals : [nodeExternals()],
    module : {
        rules : [
            {
                test : /\.js$/,
                use : 'babel-loader',
                exclude : /node_modules/
            },
            {
                test : /\.css$/,
                use : 'ignore-loader'
            },
            {
                test : /\.vue$/,
                loader : 'vue-loader',
                options : {
                    extractCSS : true
                }
            }
        ]
    },
    devtool : 'source-map',
    resolve : {
        alias : {
            'vue$' : 'vue/dist/vue.esm.js'
        }
    },
    mode : 'development',
    plugins : [
        new ExtractTextPlugin('style.css')
    ]
};
```
其他打包的文件的具体内容可以去看对应的文件即可。当我们执行打包命令后，打包后的js文件存放在dist目录下。

然后创建一个本地服务器，并将打包后的js文件引入进来：
```
const express = require('express');
const ap = express();
const renderer = require('vue-server-renderer').createRenderer();
const {createApp} = require('./dist/bundle_server.js');
const {app} = createApp();
ap.use('/' , express.static(__dirname + '/dist'));
ap.get('/' , (req , res) => {
    renderer.renderToString(app , (err , html) => {
        if (err) {
            res.status(500).send(`
                <h1>Error: ${err.message}</h1>
                <pre>${err.stack}</pre>
            `)
        } else {
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>Document</title>
                    <link rel="stylesheet" href="style.css">
                </head>
                <body>
                    <div id="app">
                        ${html}
                    </div>
                </body>
                </html>
            `)
        }
    });
});

ap.listen(3000 , () => {
    console.log('listening port 3000')
})
```
当我们启动服务器，监听3000端口，打开浏览器localhost:3000，就可以看到具体内容了：

![图片](https://github.com/andyChenAn/webpack-learn/raw/master/服务端渲染/image/2.png)


我们打开浏览器的开发者工具，可以发现服务器返回的是整个页面的内容，这就表示服务器渲染成功了：

![图片](https://github.com/andyChenAn/webpack-learn/raw/master/服务端渲染/image/3.png)