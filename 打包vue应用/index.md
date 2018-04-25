# 打包vue应用
这里执行简单的创建一个打包vue应用，比较简单。

- 第一步：创建一个vue文件
```
// App.vue文件
<template>
    <div id="app">
        <h1>{{message}}</h1>
    </div>
</template>
<script>
export default {
    data () {
        return {
            message : 'hello world'
        }
    }
}
</script>
<style>
*{
    margin: 0;
    padding: 0;
    list-style: none;
}
body {
    font-family: 'Courier New', Courier, monospace;
}
h1{
    font-size: 20px;
    color: #f00;
}
</style>

```
- 第二步：创建一个webpack打包入口文件
```
import Vue from 'vue';
import App from './App.vue';
new Vue({
    el : '#app',
    render (h) {
        return h(App);
    }
})
```
- 第三步：创建webpack.config.js文件
```
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
module.exports = {
    entry : './src/app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'build.js',
        publicPath : '/'
    },
    mode : 'development',
    module : {
        rules : [
            {
                test : /\.vue$/,
                loader : 'vue-loader',
                options : {
                    extractCSS : true
                }
            },
            {
                test : /\.js$/,
                use : 'babel-loader'
            }
        ]
    },
    resolve : {
        alias : {
            'vue$' : 'vue/dist/vue.esm.js'
        }
    },
    optimization : {
        splitChunks : {
            name : 'commons',
            chunks : 'all',
            minChunks : 1
        }
    },
    devtool : 'cheap-eval-source-map',
    plugins : [
        new ExtractTextPlugin('style.css'),
        new HtmlWebpackPlugin({
            title : '打包vue应用',
            filename : 'index.html',
            template : 'index.html',
            inject : true
        }),
        new OpenBrowserPlugin({
            url : 'http://localhost:8080'
        })
    ]
};
```
### 用法：
1. 首先将文件下载下来
2. 然后执行npm install命令来安装所有依赖
3. 执行npm run dev来执行打包，并会自动打开http://localhost:8080页面。