# plugins
webpack的plugins选项可以提供各种各样的插件，来扩展webpack的功能。plugins选项的值是一个数组，数组里面包含我们希望使用的webpack插件。

因为插件太多了，我这里学习几个常用的插件：
- html-webpack-plugin

这个插件的作用就是帮助在通过webpack打包过程中自动生成html文件，并且会将打包后的js文件插入到html中。
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
	plugins : [
		new HtmlWebpackPlugin({
			title : 'webpack-demos',
			filename : 'assets/index.html',
			template : './template/andy.ejs',
			inject : 'body'
		})
	],
	module : {
		rules : [
			{
				test : /\.ejs$/,
				use : 'ejs-loader'
			}
		]
	}
}
```
html-webpack-plugin插件其实有比较多的选项，比如，上面的代码中的title，filename，template，inject，就是其中的一些。
