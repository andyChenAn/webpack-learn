# 编写webpack插件
webpack本身就是一个插件集合，在webpack构建过程中，通过使用插件来指定各个阶段需要执行的构建逻辑。而在编写插件之前，我们需要大概了解一下webpack的整个执行过程：
通过一段代码，我们来打印一下webpack执行的主要流程：
```
function MyPlugin () {

};
MyPlugin.prototype.apply = function (compiler) {
    compiler.hooks.compile.tap('compile' , (params) => {
        console.log('webpack开始编译...')
    });
    compiler.hooks.entryOption.tap('entryOption' , (context , entry) => {
        console.log('查找入口文件...');
    })
    compiler.hooks.run.tap('run' , (compilation ) => {
        console.log('webpack开始执行');
    });
    compiler.hooks.done.tap('done' , () => {
        console.log('webpack执行结束')
    })
    compiler.hooks.compilation.tap('compilation' , (compilation) => {
        console.log('webpackk开始产生第一个版本...');
        compilation.hooks.optimize.tap('optimize' , () => {
            console.log('开始优化编译');
        })
    });
    compiler.hooks.make.tap('make' , (compilation) => {
        console.log('开始任务');
    })
    compiler.hooks.afterCompile.tap('afterCompiler' , (compilation) => {
        console.log('编译完成');
    })
    compiler.hooks.emit.tap('emit' , (compilation) => {
        console.log('准备生产文件，有最后的机会修改资源文件');
    })
    compiler.hooks.afterEmit.tap('afterEmit' , (compilation) => {
        console.log('已经生产文件');
    })
};
module.exports = MyPlugin;
```
打印结果为：
```
查找入口文件...
webpack开始执行
webpack开始编译...
webpackk开始产生第一个版本...
开始任务
开始优化编译
编译完成
准备生产文件，有最后的机会修改资源文件
已经生产文件
webpack执行结束
```
所以我们在编写插件时，可以在webpack执行的各个阶段中，自行添加自己需要执行的逻辑。因此，编写插件的话，需要我们要看一些webpack的源码，了解webpack内部钩子。
### 如何编写插件？
- 1、首先定义一个函数
- 2、在这个函数的prototype属性上添加一个apply方法
- 3、在apply方法内，绑定webpack内部的事件钩子