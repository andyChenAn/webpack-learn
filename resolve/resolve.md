# resolve
webpack中的resolve选项主要是用于模块解析，这里只挑选一些常见的来学习。
- alias

该选项表示设置解析模块路径的别名，比如，有一些模块是在多个地方需要用到的，这个时候我们可以对解析这个模块的路径设置一个别名，这样会比较方便。
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js'
	},
	resolve : {
		alias : {
			aa : path.resolve(__dirname , 'src/'),
			jquery : 'jquery/dist/',
			vue$ : 'vue/dist/vue.esm.js'
		}
	},
	mode : 'development'
}
```
```
// app.js文件
const {add} = require('aa/add.js');
const $ = require('jquery/jquery.js');
import Vue from 'vue';
console.log(add(1,4));
console.log($)
console.log(Vue);
```
上面的代码中，我们可以看出，我们对src目录设置了别名为aa，也就是说，我们在通过import或者require()的方法引入src目录下的模块文件时，我们可以直接require('aa/add.js')的方式引入即可，同时我们也可以直接在node_modules中找到对应的模块来直接设置对应路径的别名，同时我们也可以添加$后缀来表示精准匹配。当我们打包后，打开浏览器就可以打印出对应的结果，是不是很不错。
- extensions

当webpack在解析模块时，我们可以通过设置extensions选项来指定webpack会自动解析文件的扩展名，比如：
```
// webpack.config.js
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js'
	},
	resolve : {
		alias : {
			aa : path.resolve(__dirname , 'src/'),
			jquery : 'jquery/dist/',
			vue$ : 'vue/dist/vue.esm'
		},
		extensions : ['.js' , '.json']
	},
	mode : 'development'
}
```
上面代码中，我们设置了extensions的值是一个数组，里面包括.js和.json，这就表示当webpack在解析js文件或者json文件的时候，就我们可以不用添加文件后缀名，webpack会自动扩展后缀名。