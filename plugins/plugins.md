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

html-webpack-plugin插件的选项：
- title

表示自动生成的html文件的title
- filename

表示生成的html文件的路径
- template

表示生成html文件所需要的模板
- inject

表示将打包的js文件插入到哪个位置，可以是'body',"head",true,false。
- chunks

表示指定在生成的html文件引入哪些打包生成的入口js文件
- excludeChunks

这个作用刚好和chunks相反，表示指定在生成的html文件中不引入哪些打包生成的入口js文件
- hash

表示给生成的js文件一个hash值
- minify

表示是否要压缩生成的html文件

以上这几个选项是比较常用的。当然我们也可以不传入任何配置项，该插件会使用它的默认项。
```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : './app.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : 'bundle.js'
    },
    mode : 'development',
    plugins : [
        new HtmlWebpackPlugin({
            title : 'webpack-demo',
            filename : './assets/demo.html'
        })
    ]
};
```
##### 这里我们来看下html-webpack-plugin插件是如何使用模板生成html文件的？
我这里就使用ejs模板来解释，先看一个例子：

```
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : {
        app : './app.js',
        demo : './demo.js'
    },
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : '[name].bundle.js'
    },
    mode : 'development',
    plugins : [
        new HtmlWebpackPlugin({
            title : 'webpack-demo1',
            filename : './assets/demo1.html',
            template : './template/index.ejs',
            chunks : ['demo']  //表示在demo1.html文件中引入demo.bundle.js文件
        }),
        new HtmlWebpackPlugin({
            title :'webpack-demo2',
            filename : './assets/demo2.html',
            template : './template/index.ejs',
            chunks : ['app']   //表示在demo2.html文件中引入app.bundle.js文件
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
};
```
从上面代码中，我们可以看到，在使用webpack打包时生成了两个html文件，一个是demo1.html，一个是demo2.html，当然我们还可以生成更多的html文件，只要调用html-webpack-plugin插件就可以了，那我们看到，两个不同的html文件，但是我们使用了相同的template，同时还添加了一个chunks属性，这个属性的作用就是当我们生成多个入口js文件后，我们可以通过配置chunks属性的值来决定在生成的html文件中引入哪些js文件。

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry : {
        app : './app.js',
        demo : './demo.js'
    },
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename : '[name].bundle.js'
    },
    mode : 'development',
    plugins : [
        new HtmlWebpackPlugin({
            title : 'webpack-demo1',
            filename : './assets/demo1.html',
            template : './template/index.ejs',
            chunks : ['demo'],
            hash : true,
            minify : {
                removeComments : true,
                removeAttributeQuotes : true
            }
        }),
        new HtmlWebpackPlugin({
            title :'webpack-demo2',
            filename : './assets/demo2.html',
            template : './template/index.ejs',
            chunks : ['app']
        })
    ],
    module : {
        rules : [
            {
                test : /\.ejs$/,
                use : 'ejs-loader'
            },
            {
                test : /\.css$/,
                use : ['style-loader' , 'css-loader']
            }
        ]
    }
};
```
这样通过html-webpack-plugin插件的使用，我们就能够灵活的生成html文件。