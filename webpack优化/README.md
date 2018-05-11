# webpack优化
对webpack进行优化，主要是两方面，一方面是优化开发体验，另一方面是优化输出质量，优化开发体验，主要指的就是构建速度，而优化输出质量，主要指的就是减少首屏加载时间等。
#### 1、优化webpack配置项loader
优化loader，主要是通过loader选项中的三个属性来实现，分别是：test，exclude，include，通过对exclude和include的配置，可以让我们知道再哪些地方需要执行加载器，哪些地方不需要，避免所有的匹配的文件都会通过loader来执行。
#### 2、优化webpack配置项resolve.module
在解析第三方模块时，webpack通过查找"node_modules"目录下的具体模块来解析，如何"node_modules"目录不存在该模块，那么就向上一级的"node_modules"目录查找，这个查找过程和nodejs的模块解析比较类似，一般来说，我们都会将第三方模块按照在根目录下的"node_modules"目录下，所以我们执行需要指定为这个目录，那么webpack在执行的时候，就不会向上查找了。
#### 3、优化webpack配置项resolve.mainFields
resolve.mainFields，用于配置第三方模块使用哪个入口文件，一般来说，我们都会看到第三方模块存在一个package.json文件，用于描述这个模块的属性，其中某些字段用于描述入口文件在哪里，resolve.mainFields用于配置哪个字段作为入口文件的描述，一个第三方模块可以存在多个字段描述入口文件，因为一个模块可能同时用于多个环境，比如node环境，浏览器环境，针对不同的环境采用不同的代码，像isomorphic-fetch模块，package.json文件中有两个描述入口文件的字段：

```
{
    "browser": "fetch-npm-browserify.js",
    "main": "fetch-npm-node.js"
}
```
一个用于node环境，一个用户浏览器环境，通过webpack源码我们也可以看出：当target字段的值是web或者webworker时，resolve.mainFields的值为["browser", "module", "main"]，这就表示webpack首先会去找browser字段描述的入口文件，如果没有，那么会去找module字段描述的入口文件，如果没有，那么会去找main字段描述的入口文件。当target为除web或webworker之外的值时，resolve.mainFields的值为["module", "main"]，这就表示webpack首先会去找module字段描述的入口文件，如果没有，那么会去找main字段描述的入口文件。

```
this.set("resolve.mainFields", "make", options => {
	if (options.target === "web" || options.target === "webworker")
		return ["browser", "module", "main"];
	else return ["module", "main"];
});
```
其实这里就比较浪费时间，一般来说，第三方模块都会有一个main字段来描述入口文件，这里我们可以直接将resolve.mainFields的值设置为"main"来提高构建速度。

```
resolve : {
    mainFields : 'main'
}
```
#### 4、优化webpack配置项resolve.alias
第三方模块查找都是从node_modules目录下来查找的，通过别名来将原加载路径映射到一个新的路径上，比如说一些比较大的第三方模块，本身内部可能就会依赖很多其他的模块，那么当webpack在查找对应文件的时候会比较的慢，如果我们通过resolve.alias来将路径映射到一个新的路径上，那么查找就会比较快，而不需要遍历其他文件，从而来提高构建速度。
```
resolve : {
    alias : {
        'vue' : 'vue/dist/vue.esm.js'
    }
}
```
#### 5、优化webpack配置项resolve.extensions
在加载文件时，如果我们没有添加文件后缀名，那么webpack会自动带上后缀名去尝试查找文件是否存在，通过源码，默认情况下，webpack会自动带上的后缀名有：
```
this.set("resolve.extensions", [".wasm", ".mjs", ".js", ".json"]);
```
所以首先会带上.wasm，然后是.mjs，然后是.js，然后是.json，如果我们一开始就指定了后缀名，那么webpack就自动带上相关的后缀名去查找文件，最后还是自己写上后缀名会好点。
#### 6、优化webpack配置项module.noParse
module.noParse，表示忽略对于没有采用模块化的文件解析处理，比如一些比较老的jQuery版本是没有采用模块化的写法。
#### 7、使用DllPlugin
.dll文件，叫做动态链接库。在一个动态链接库中可以包含其他模块调用的函数和数据。那其实就是把公共的部分提取出来，作为一个动态链接库供其他模块调用。具体代码可以参考"使用dll来优化"这个例子。
#### 8、使用happypack
通过创建多个进程来打包文件，从而提升构建速度。