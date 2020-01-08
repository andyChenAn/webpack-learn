# html-webpack-plugin插件
当使用webpack打包时，如果我们需要创建一个html文件，并且把webpack打包后的静态文件自动插入到这个html文件中时，我们可以使用html-webpack-plugin插件。

### 默认使用
当我们调用HtmlWebpackPlugin时，默认就会在output.path路径下创建一个index.html文件，并且在这个index.html文件中插入一个script标签，标签的src为output.filename。
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode : 'development',
    entry : './docs/one.js',
    output : {
        filename : '[name].js',
        path : path.resolve(__dirname , '../dist')
    },
    plugins : [
        new HtmlWebpackPlugin()
    ]
};
```
创建的index.html文件的代码如下：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Webpack App</title>
  </head>
  <body>
  <script type="text/javascript" src="main.js"></script></body>
</html>
```
### 生成一个html文件
我们可以使用htmlWebpackPlugin插件中的配置项，来配置我们需要生成的html文件，比如，我们可以指定生成的html文件的路径，可以指定文件的模板，指定生成的html文件的title等。

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode : 'development',
    entry : './docs/one.js',
    output : {
        filename : '[name].js',
        path : path.resolve(__dirname , '../dist')
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : '这是一个标题',
            filename : 'index.html',
            template : 'public/index.html'
        })
    ]
};
```
这里我们需要注意的是，template的路径和filename的路径不同，当匹配模版路径的时候将会从项目的根路径开始。