# target（构建目标）
webpack可以通过target配置项来为js在不同的宿主环境下提供编译能力，为了能正确的进行编译，我们就需要在webpack的配置项里通过target来进行配置。默认情况下，target的值是"web"，也就是为浏览器的环境提供编译，说白了就是在浏览器环境下可以执行打包后的js。
```
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const baseConfig = {
    target : 'async-node',
    entry : {
        app : './app.js'
    },
    output : {
        filename : '[name].js',
        path : path.resolve(__dirname , 'dist')
    },
    mode : 'development'
}

let targets = ['web', 'webworker', 'node', 'async-node', 'node-webkit', 'electron-main'].map((target) => {
    let base = webpackMerge(baseConfig, {
      target: target,
      output: {
        path: path.resolve(__dirname, './dist/' + target),
        filename: '[name].' + target + '.js'
      }
    });
    return base;
  });
  
module.exports = targets;
```
上面的代码就是为不同的宿主环境创建打包后的js文件。


这里我们可以通过electron来创建一个桌面应用，来看一下target的使用，首先我们把target的值设置为"node"来构建：
```
const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    target : 'node'
};
```
然后输入命令"electron ."，会发现报错，这就表示在electron应用中是不能通过node环境来执行js的。

我们再通过将target的值设置为"electron-main"：

```
const path = require('path');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    target : 'electron-main'
};
```
然后输入命令"electron ."，发现没有报错，展示了electron桌面应用。

所以说在不同的宿主环境下，我们可以通过配置target来打包js文件。
