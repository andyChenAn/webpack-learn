# webpack构建react应用
我们可以使用create-react-app快速的搭建react应用，除此之外，我们也可以自己手动的去搭建react应用。
#### 步骤

##### 第一步：安装webpack
- 我们使用webpack来构建应用，所以我们需要先在本地安装webpack，执行命令：
```
npm install webpack webpack-cli --save-dev
```
通过上面的命令，我们就在本地安装了webpack和webpack-cli，webpack4.0以上版本是需要安装webpack-cli的。

那么我们就可以再package.json文件中定义npm scripts，比如：
```js
"scripts": {
    "start": "webpack --config webpack.config.js"
},
```

##### 第二步：安装babel(javascript编译器)

babel，用于将ECMA2015+版本以上的javascript语法转换为向后兼容的javascript语法。这样我们就可以使用最新的js语法，再通过babel转换成浏览器可识别的js语法。

安装babel，我们需要执行命令：
```
npm install --save-dev @babel/core @babel/cli @babel/preset-env
```
安装@babel/polyfill

```
npm install --save @babel/polyfill
```

**注意点：**

1、babel只会转换es6+语法，并不会转换api，想让新的api生效，那么我们就需要引入polyfill，这个时候就需要引入@babel/polyfill模块。

2、安装@babel/polyfill模块必须用--save，包装模块是在生产环境中使用，而不是在开发环境中使用，因为我们的代码最后都是要上线的，如果代码依赖的polyfill模块只是在开发环境下依赖，而在生产环境下没有依赖，那么代码如果使用了新的api，则在生产环境中就会报错了，因为浏览器不识别这个api。

3、@babel/polyfill模块里面包含了很多对于新api的polyfill方法而已。

webpack集成polyfill，我们可以再webpack.config.js文件中，将入口文件改成这样：
```javascript
const path = require('path');
module.exports = {
  // entry : ['core-js' , './index.js']
  entry : ['@babel/polyfill' , './index.js'],
  mode : 'development',
  output : {
    filename : 'app.js',
    path : path.resolve(__dirname , 'dist')
  }
};
```
上面entry是一个数组，会执行数组中的每一个文件，并将所有文件打包到一个指定的文件中。所以在app.js文件中就会包括很多polyfill的api。

我们也可以使用core-js来代替@babel/polyfill，而@babel/polyfill会被放弃。

```json
// .babelrc文件
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns" : "usage",
        "corejs" : 3
      }
    ]
  ]
}
```
当我们在.babelrc文件中配置polyfill，那么就不需要在webpack.config.js中的entry中在添加`entry : ['@babel/polyfill' , './index.js']`，我们只需要在入口文件`index.js`的顶部添加`import "core-js"`或者`require("core-js")`就可以了。这样也就可以将polyfill方法引入进来。

##### 第三步：安装babel-loader

```
npm install babel-loader --save
```
我们怎么把js代码语法进行转换呢？我们就需要当webpack遇到js文件的时候，通过babel-loader去进行加载，最后输出转换后的js内容。

如果我除了想转换js语法之外，还想转换jsx语法呢？那么我们需要安装@babel/preset-react来实现

```
npm install @babel/preset-react --save
```
我们只需要在.babelrc配置文件中的`presets`下添加`@babel/preset-react`就可以了。
```
// .babelrc文件
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns" : "usage",
        "corejs" : 3
      }
    ],
    "@babel/preset-react"
  ]
}
```
##### 第四步：安装typescript和awesome-typescript-loader

我们使用react的时候，也可能会使用到typescript，那么我们是通过什么来编译typescript的呢？我们需要安装`typescript`和`awesome-typescript-loader`来编译typescript代码。

```
npm install typescript awesome-typescript-loader source-map-loader --save-dev
```
安装完成之后，我们在webpack.config.js文件中添加上ts模块的加载规则

```javascript
module.exports = {
  module : {
    rules : [
      {
        test : /\.tsx?$/,
        exclude : /node_modules/,
        loader : 'awesome-typescript-loader'
      }
    ]
  }
};
```
除此之外，我们还需要安装`@types/react`模块。我们可以在根目录下面，定义个tsconfig.json文件，用来配置ts。

**在配置ts中遇到的错误**

当写好ts模块加载规则后，我们没有创建tsconfig.json文件，那么在解析ts或者tsx文件的时候，会使用默认的配置去解析。就来看一下，我在配置ts的时候会遇到的一些问题。

```
TS1259: Module '"E:/vosa-react/node_modules/@types/react/index"' can only be default-imported using the 'esModuleInterop' flag
```
我们只需要将`esModuleInterop`设置为`true`。

```
// tsconfig.json文件
{
  "compilerOptions":{
    "esModuleInterop":true
  }
}
```

```
TS2583: Cannot find name 'Set'. Do you need to change your target library? Try changing the `lib` compiler option to es2015 or later.
```
我们需要将`target`设置为`es6`。

```
{
  "compilerOptions":{
    "esModuleInterop":true,
    "target":"ES6"
  }
}
```

```
ERROR in [at-loader] ./node_modules/@types/react/index.d.ts:38:22
    TS2307: Cannot find module 'csstype' or its corresponding type declarations.
```
这个问题，我们需要将`module`设置为`commonjs`。

```
{
  "compilerOptions":{
    "esModuleInterop":true,
    "target":"ES6",
    "module": "commonjs"
  }
}
```

```
TS17004: Cannot use JSX unless the '--jsx' flag is provided.
```
这个问题，我们需要将`jsx`设置为`react`。表示的是，在tsx文件里面支持jsx语法。

```
{
  "compilerOptions":{
    "esModuleInterop":true,
    "target":"ES6",
    "module": "commonjs",
    "jsx":"react"
  }
}
```
##### 第五步：webpack添加本地服务器
这里我们需要安装webpack-dev-server
```
npm install --save-dev webpack-dev-server
```
当我们安装完webpack-dev-server后，我们可以在修改一下package.json文件中的npm scripts

```
{
    "scripts" : {
        "start" : "webapck-dev-server --config --hot webpack.config.js"
    }
}
```

然后修改`webpack.config.js`文件

```javascript
devServer : {
    port : 9000,
    hot : true,
    compress : true,
    publicPath : '/'
}
```
这样我们再执行`npm run start`命令的时候，我们就可以开启一个本地服务器。而且修改代码的时候也会进行热更新。

##### 第六步：安装html-webpack-plugin

```
npm install html-webpack-plugin --save-dev
```
我们需要把打包后的js文件放在一个html文件中，而html-webpack-plugin插件会帮我们自动生成一个html文件，并且把打包后的js插入到html中。

```javascript
plugins : [
    new HtmlWebpackPlugin({
      template : './public/index.html',
      filename : 'index.html',
    })
]
```

当我们在开发过程中，我们会经常引用其他文件，那么我们也可以使用webpack配置来去掉文件后缀和使用别名来减少引用的路径层级问题。我们可以设置webpack的resolve属性下的extensions和alias属性。

extensions可以为文件自动添加扩展名，alias可以指定路径的别名。比如：
```javascript
module.exports = {
    resolve : {
        extensions : ['.js' , '.jsx' , '.ts' , '.tsx' , '.json'],
        alias : {
          "@components" : './components/'
        } 
    }
}
```
当我们引用一个组件时可以这样：

```javascript
import Hello from '@component/Hello/Hello';
```
我们就不需要像下面这样引用组件：

```
import Hello from '../../../components/Hello/Hello'
```


##### 第七步：解析样式
样式文件包括，css，scss，less，我们需要安装相应的loader来解析

```
npm install style-loader css-loader sass-loader less-loader node-sass --save-dev
```
然后我们再修改一下`webpack.config.js`文件：

```javascript
module.exports = {
    module : {
        rules : [
            {
                test : /\.css$/,
                exclude : /node_modules/,
                loader : ['style-loader' , 'css-loader']
            }
        ]
    }
}
```
上面的配置，主要是会将引入的css文件先通过css-loader解析，然后再交给style-loader解析，style-loader主要就是将css代码通过style标签插入到html中。

如果我想要加载预编译的css文件呢？比如scss文件，那么我们就需要用到sass-loader来帮我去解析scss文件。sass-loader主要就是讲scss文件编译成css。

```javascript
module.exports = {
    {
        test : /\.s?css$/,
        exclude : /node_modules/,
        loader : ['style-loader' , 'css-loader' , 'sass-loader']
    }
}
```
那我们怎么将css打包到一个css文件，而不是通过style标签插入到html中呢？我们可以使用`mini-css-extract-plugin`来将每个js文件中引入的css文件打包成一个单独的css文件，而不是将所有的css都插入到html中。

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
  module : {
      rules : [
        {
            test : /\.s?css$/,
            exclude : /node_modules/,
            use : [MiniCssExtractPlugin.loader , 'css-loader' , 'sass-loader']
          },
          {
            test : /\.less$/,
            exclude : /node_modules/,
            use : [MiniCssExtractPlugin.loader , 'css-loader' , 'less-loader']
          }
      ]
  },
  plugins : [
    new MiniCssExtractPlugin({
      filename : '[name].css'
    })
  ]
}
```
虽然我们将css打包到了一个css文件中，但是当我们修改css代码的时候，并不会触发热更新，这个时候我们需要来设置`hmr`为true。

```javascript
{
    test : /\.s?css$/,
    exclude : /node_modules/,
    use : [
      {
        loader : MiniCssExtractPlugin.loader,
        options : {
          // 开发环境需要开启，生产环境可以不用开启
          hmr : true
        }
      }, 
      'css-loader' , 
      'sass-loader'
    ]
}
```
现在我们修改css也可以热更新了，但是发现打包出来的css文件并没有压缩，所以我们需要打包css后并压缩css文件，包括js文件也是需要被压缩的。这个时候，我们可以使用`optimize-css-assets-webpack-plugin`来压缩css文件，可以使用`terser-webpack-plugin`来压缩js文件。

```javascript
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
module.exports = {
    optimization : {
        minimize : true,
        minimizer : [
          new TerserWebpackPlugin(),
          new OptimizeCssAssetsPlugin()
        ]
    }
}
```
或者使用plugins选项也是可以的：

```javascript
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
module.exports = {
    plugins : [
        new TerserWebpackPlugin(),
        new OptimizeCssAssetsPlugin()
    ]
}
```
我们接下来就是要配置css的厂商前缀，我们需要安装`autoprefixer`和`precss`
```
 npm install autoprefixer precss --save-dev
```
除此之外，我们还需要定义一个`postcss-config.js`文件

```javascript
// postcss.config.js
module.exports = {
  plugins : [
    require('precss'),
    require('autoprefixer')
  ]
}
```
这里出现了一个错误

```
Could not resolve the @import for "./style.less"
```
主要是因为我把`postcss-loader`放在`less-loader`的后面，应该调换一下位置，让css文件先通过`less-loader`编译，然后再到`postcss-loader`编译就好了。

我们还需要定义一个`.browserslistrc`文件，里面就写浏览器版本就可以了
```
// .browserslistrc
last 15 versions
```
接下来就是如何解析css中的图片了，我们可以使用`url-loader`和`file-loader`来实现。
```javascript
{
    test : /\.png|jpg|gif|jpeg/,
    use : [
      {
        loader : 'url-loader',
        options : {
          limit : 5120,
          name : 'img/[name].[ext]'
        }
      }
    ]
}
```
### 安装eslint代码检查
通过eslint代码检查，我们可以很好的制定代码规范，我们需要安装`eslint`和`eslint-loader`

```
npm install eslint eslint-loader --save-dev
```
这样子我们就可以通过eslint进行代码检查，然后就能根据我们自己设置的eslint的规则来编写代码，这在多人联合开发的时候对于统一代码规范是非常重要的。

### 打包img标签中的图片
我上面说过，在css文件中打包背景图片，除此之外，我们还可能会在`<img>`标签中引入本地图片，如果我们直接打包，会导致img不能准确的引用到图片地址，我们可以这样做，分为两步：

- 第一步：在img标签中的src属性，使用require('图片路径')
- 第二步：url-loader中options中配置`esModule : false`，因为url-loader默认使用ES moudles语法来生成js模块，当我们把它设置为false时，就变成了CommonJS模块了。

```javascript
module.exports = {
{
    test : /\.png|jpg|gif|jpeg/,
    use : [
      {
        loader : 'url-loader',
        options : {
          limit : 5120,
          name : 'img/[name].[ext]',
          esModule : false
        }
      }
    ]
  }
}
```
### 隐藏webpack编译信息
我们在编译的时候，会发现一大堆的编译信息，看起来很难看，所以我们需要隐藏掉他，这样也看着舒服一点，我们需要安装`friendly-errors-webpack-plugin`来处理这个问题。

```
npm install friendly-errors-webpack-plugin --save-dev
```