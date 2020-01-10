# css打包
现在我们在搭建项目的时候，一般都会选择使用less或者sass来写css，当然也可以使用css，只是less或者sass更加的方便灵活。

像现在我们搭建的vue应用中，css文件都会放在vue文件中，或者js文件中，那么webpack是怎么将vue文件或者js文件中的css文件提取出来呢？

### mini-css-extract-plugin插件
在webpack4中，我们通过mini-css-extract-plugin插件来将js文件中的css提取出来，放在一个css文件中。

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    mode : 'development',
    entry : {
        app : './docs/one.js'
    },
    output : {
        filename : '[name].js',
        path : path.resolve(__dirname , '../dist')
    },
    plugins : [
        new HtmlWebpackPlugin({
            title : '这是一个标题',
            filename : 'index.html',
            template : 'public/index.html'
        }),
        new MiniCssExtractPlugin({
            filename : '[name].css'
        })
    ],
    module : {
        rules : [
            {
                test : /\.(sa|sc|c)ss$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
};
```
上面代码中，我们执行webpack打包时，就会把one.js文件中引入的css文件，提取出来，放在output.path目录下面。

### CSS热更新

一般我们在开发环境中，在修改css的时候都希望，css一改变，页面就立刻刷新，展示最新的样式，实现热更新的功能，而在生成环境中我们不需要热更新的功能，那么我们可以这样做：

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';
module.exports = {
    mode : devMode ? 'development' : 'production',
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
        }),
        new MiniCssExtractPlugin({
            filename : '[name].css'
        })
    ],
    module : {
        rules : [
            {
                test : /\.(sa|sc|c)ss$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader,
                        options : {
                            hmr : devMode
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
};
```
然后我再执行这条命令：

```
NODE_ENV=production webpack --color --config build/webpack.base.conf.js
```
这样我们就可以通过NODE_ENV的值来判断我是在开发环境中，还是在生成环境中，如果是开发环境中，我们就启用热更新，否则就不启用。

### CSS代码压缩

当我们打包应用的时候，发现打包出来的css代码并没有进行压缩，这时候我们需要对css代码进行压缩，减少css文件大小，可以使用optimize-css-assets-webpack-plugin插件来压缩css代码：

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
module.exports = {
    mode : devMode ? 'development' : 'production',
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
        }),
        new MiniCssExtractPlugin({
            filename : '[name].css',
            chunkFilename : '[id].css'
        }),
        new OptimizeCssAssetsPlugin()
    ],
    module : {
        rules : [
            {
                test : /\.(sa|sc|c)ss$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader,
                        options : {
                            hmr : devMode
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
};
```
### CSS厂商前缀处理和less或sass

我们发现，很多时候我们都会使用一些比较新的css属性，而浏览器为了兼容都会有一个厂商前缀，那我们怎么来做到只需要写一遍样式，而不需要写几遍带有厂商前缀的样式呢？这个时候我们需要使用postcss来处理：

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
module.exports = {
    mode : devMode ? 'development' : 'production',
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
        }),
        new MiniCssExtractPlugin({
            filename : '[name].css',
            chunkFilename : '[id].css'
        }),
        new OptimizeCssAssetsPlugin()
    ],
    module : {
        rules : [
            {
                test : /\.(sa|sc|c)ss$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader,
                        options : {
                            hmr : devMode
                        }
                    },
                    'css-loader',
                    'sass-loader',
                    'postcss-loader'
                ]
            }
        ]
    }
};
```
我们除了使用postcss-loader来加载css之外，还需要再定义一个postcss.config.js文件，这个是postcss的配置文件：

```javascript
module.exports = {
    // 这里表示我们使用了postcss中的autoprefixer插件
    plugins : {
        autoprefixer : {}
    }
}
```
autoprefixer插件会在打包的时候，自动帮我们添加厂商前缀。除此之外，我们还需要在package.json文件中，定义browserList字段，这个字段表示用来限定浏览器的版本。

```javascript
"browserslist" : [
    "defaults",
    "not ie < 8",
    "last 2 versions",
    "Firefox > 20",
    "> 1%",
    "iOS 7",
    "last 3 iOS versions"
  ]
```
综上所述，我们就可以在打包的过程中，就会帮我们自动的添加上css厂商前缀了。我们除了可以打包sass，也可以打包less，比如：

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
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
        }),
        new MiniCssExtractPlugin({
            filename : '[name].css',
            chunkFilename : '[id].css'
        }),
        new OptimizeCssAssetsPlugin()
    ],
    module : {
        rules : [
            {
                test : /\.(sa|sc|c)ss$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader',
                    'postcss-loader'
                ]
            },
            {
                test : /\.less$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'less-loader',
                    'postcss-loader'
                ]
            }
        ]
    }
};
```
### css文件中的图片处理
一般我们处理图片都是通过file-loader和url-loader来处理。

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
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
        }),
        new MiniCssExtractPlugin({
            filename : '[name].css',
            chunkFilename : '[id].css'
        }),
        new OptimizeCssAssetsPlugin()
    ],
    module : {
        rules : [
            {
                test : /\.(sa|sc|c)ss$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader',
                    'postcss-loader'
                ]
            },
            {
                test : /\.less$/,
                use : [
                    {
                        loader : MiniCssExtractPlugin.loader,
                        options : {
                            hmr : true
                        }
                    },
                    'css-loader',
                    'less-loader',
                    'postcss-loader'
                ]
            },
            {
                test : /\.jpe?g|png|gif/,
                use : [
                    {
                        loader : 'url-loader',
                        options : {
                            limit : 2000,
                            name : 'img/[name].[ext]'
                        }
                    }
                ]
            }
        ]
    }
};
```
url-loader: 可以将css文件中的字体和图片url转化为base64字符串，从而减少对资源的发起 http 请求次数。我们可以通过配置一个limit字段，来限制如果图片小于limit，那么就将图片转为base64。

file-loader：可以修改图片的名称，将图片输出到指定的路径。

```javascript
{
    test : /\.jpe?g|png|gif/,
    use : [
        {
            loader : 'file-loader',
            options : {
                name : 'img/[name].[ext]'
            }
        }
    ]
}
```
