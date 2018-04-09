# module(模块)
### webpack模块主要指的是那些模块？
- ES2015中的import引入的模块
- 通过CommonJS规范中的require语句加载的模块
- 通过AMD中的define和require加载的模块
- css文件中的@import引入的文件
- backgorund中的url和img标签中的src链接的图片

以上都属于webpack模块，那么我们在使用webpack打包时，遇到这些模块时，就会通过指定的loader去加载这些模块。

#### 加载css文件
当我们需要加载css文件时，我们一般会用到的loader就是css-loader,style-loader，比如：
```
// webpack.config.js文件
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
				test : /\.css$/,
				exclude : /node_modules/,
				use : ['style-loader' , 'css-loader']
			}
		]
	}
}
```
```
// app.js文件
require('./app.css');
```
```
// ./css/reset.css文件
@import './css/reset.css';
body {
    background-color: blue;
}
```
上面代码中，我们可以看出，当加载css文件时，首先会使用css-loader来加载css文件中通过@import引入的css文件，然后再使用style-loader来将css文件中的内容通过创建style标签的方式添加到style标签内。
#### 加载图片
当我们使用webpack打包时，会遇到img标签会加载图片，或者css文件中的背景图，就会通过url-loader，file-loader来加载，比如：
```
const path = require('path');
module.exports = {
	entry : './app.js',
	output : {
		path : path.resolve(__dirname , 'dist'),
		filename : 'bundle.js',
		publicPath : './dist/'
	},
	mode : 'development',
	module : {
		rules : [
			{
				test : /\.(png|jpg)$/,
				use : {
					loader : 'url-loader',
					options : {
						limit : 10000
					}
				}
			}
		]
	}
}
```

```
// app.js文件
let img = document.createElement('img');
img.src = require('./star.png');
document.body.appendChild(img);

```
从上面的代码中，我们可以看出，当加载图片时，我们使用url-loader加载器来加载，这里设置了一个limit选项，目的就是当图片的大小小于10K的时候，会被转化为base64图片来加载图片。

通过上面的两个例子中，我们可以发现，其实module选项中，比较重要的属性就是rules，这个属性表示的就是加载某个模块的时候，采用什么样的规则。rules属性的值是一个数组，里面包含每个匹配模块的规则。通过test属性去匹配模块，然后通过use属性去指定该模块采用哪个loader来加载，一般就是这种方式，当然还有一些额外的选项可以设置，我们可以在options属性中去配置。