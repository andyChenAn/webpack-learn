# webpack插件

[参考这里](https://fengmiaosen.github.io/2017/03/21/webpack-core-code/)

webpack整体是一个插件架构，所有的功能都是通过插件来实现的，我们去看webpack源码，基本上整个webpack都是基于插件继承的，通过发布订阅事件来触发各个插件执行。
### compiler和compilation
在webpack插件中，最核心的应该就是compiler和compilation这两个对象了。

- compiler对象，代表的是配置完备的webpack环境，在webpack启动的时候，调用 new Compiler()构建一次，然后由webpack所有的组合配置项构建而成，看源码会比较清晰。

Compiler继承自Tapable类，其混合了Tapable类的注册和调用插件的功能，大多数面向用户的插件，都是首先在Compiler上注册的。
```
class MyPlugin {
    apply (compiler) {
        compiler.hooks.run.tap('myPlugin' , function (compilation) {
            console.log('run webpack');
        })
    }
}
module.exports = MyPlugin;
```
compiler对象的钩子：

```
		this.hooks = {
			shouldEmit: new SyncBailHook(["compilation"]),
			done: new AsyncSeriesHook(["stats"]),
			additionalPass: new AsyncSeriesHook([]),
			beforeRun: new AsyncSeriesHook(["compilation"]),
			run: new AsyncSeriesHook(["compilation"]),
			emit: new AsyncSeriesHook(["compilation"]),
			afterEmit: new AsyncSeriesHook(["compilation"]),
			thisCompilation: new SyncHook(["compilation", "params"]),
			compilation: new SyncHook(["compilation", "params"]),
			normalModuleFactory: new SyncHook(["normalModuleFactory"]),
			contextModuleFactory: new SyncHook(["contextModulefactory"]),
			beforeCompile: new AsyncSeriesHook(["params"]),
			compile: new SyncHook(["params"]),
			make: new AsyncParallelHook(["compilation"]),
			afterCompile: new AsyncSeriesHook(["compilation"]),
			watchRun: new AsyncSeriesHook(["compiler"]),
			failed: new SyncHook(["error"]),
			invalid: new SyncHook(["filename", "changeTime"]),
			watchClose: new SyncHook([]),

			// TODO the following hooks are weirdly located here
			// TODO move them for webpack 5
			environment: new SyncHook([]),
			afterEnvironment: new SyncHook([]),
			afterPlugins: new SyncHook(["compiler"]),
			afterResolvers: new SyncHook(["compiler"]),
			entryOption: new SyncBailHook(["context", "entry"])
		};
```
- compilation对象，代表了一次单一的版本构建和生成资源。当运行webpack开发环境中间件时，每当检测到一个文件变化，一次新的编译将被创建，从而生成一组新的编译资源。一个编译对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。编译对象也提供了很多关键点事件回调供插件做自定义处理时选择使用。(比如，我们使用webpack-dev-server中间件的时候，每次修改文件，那么都会重新创建一个compilation对象)

compilation对象钩子：

```
// 钩子太多了，这里就不列出来了，可以看源码，很清楚

compiler.plugin("compilation", function(compilation) {
    //主要的编译实例
    //随后所有的方法都从 compilation.plugin 上得来
});
```
主要是监听compilation事件，并在监听函数中传入compilation对象，然后再compilation对象上注册相应事件钩子。比如：
```
class MyPlugin {
    apply (compiler) {
        compiler.hooks.compilation.tap('MyPlugin' , function (compilation) {
            compilation.hooks.chunkAsset.tap('MyPlugin' , function (compilation) {
                console.log('打包完成');
            })
        })
    }
};
module.exports = MyPlugin;
```
### compiler和compilation的关系
- compiler 对象代表的是不变的webpack环境，是针对webpack的
- compilation对象针对的是随时可变的项目文件，只要文件有改动，compilation就会被重新创建。

### 总结：
- webpack插件中，最核心的两个对象就是compiler和compilation对象，一个代表的是不变的webpack环境，在webpack启动的时候就会被构建；一个代表的是随时可变的项目文件，每当我们修改保存文件时都会重新创建一个compilation对象。

- compiler对象和compilation对象都继承自Tapable类，这样它们就可以注册和调用插件。

- compiler和compilation对象都有各自的事件钩子，当我们注册一个插件时，我们可以通过触发事件来灵活的控制插件的执行时机，具有很高的可拓展性。

- compiler和compilation对象，通过在事件上注册插件，来控制整个webpack打包过程