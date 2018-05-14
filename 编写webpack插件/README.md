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
所以我们在编写插件时，可以在webpack执行的各个阶段中，自行添加自己需要执行的逻辑。因此，编写插件的话，需要我们要看一些webpack的源码，了解webpack内部钩子。通过编写插件，我们可以在webpack的生命周期中扩展自己想要的逻辑。
### 如何编写插件？
- 1、首先定义一个函数
- 2、在这个函数的prototype属性上添加一个apply方法
- 3、在apply方法内，绑定webpack内部的事件钩子

其实看完webpack官方文档，大概也能知道怎么编写插件，但是并不知道如何下手，因为不知道要监听哪个事件钩子才能完成任务。所以我们要对webpack的执行过程中的事件钩子了解清楚，这样才能针对不同的阶段，编写对应的插件。而上面的代码的打印结果，基本上就是webpack的一个大概的执行过程。当然除了compiler的事件钩子之外，还有compilation对象的事件钩子，而compiler和compilation的区别就是：compiler代表了整个webpack从启动到结束的生命周期，而compilation只是代表了一次新的编译。

##### 例子1：读取webpack输出的资源
首先我们需要了解，webpack构建过程中是什么时候输出资源的，通过源码可以看出，在emit事件发生时，表示源文件的转换和组装都已经完成了，这个时候我们可以读取资源，并且对资源进行修改。

插件代码：
```
class ReadChunks {
    constructor (options = {}) {
        this.options = options;
    };
    apply (compiler) {
        compiler.hooks.emit.tap('ReadChunks' , (compilation) => {
            compilation.chunks.forEach(chunk => {
                chunk.files.forEach(filename => {
                    let source = compilation.assets[filename].source();
                })
            })
        })
    }
};
module.exports = ReadChunks;
```
##### 例子2：修改webpack的输出资源
修改资源也是在触发emit事件时进行修改，并且webpack的输出资源都是保存在compilation.assets中，所以我们只需要重新定义compilation.assets的值即可。
```
const content = 'console.log(123)';
class ReadChunks {
    constructor (options = {}) {
        this.options = options;
    };
    apply (compiler) {
        compiler.hooks.emit.tap('ReadChunks' , (compilation) => {
            compilation.chunks.forEach(chunk => {
                chunk.files.forEach(filename => {
                    compilation.assets[filename] = {
                        source : () => {
                            return content;
                        },
                        size : () => {
                            return Buffer.byteLength(content , 'utf8');
                        }
                    }
                })
            })
        })
    }
};
module.exports = ReadChunks;
```
##### 例子3：判断webpack使用了哪些插件
```
class ReadChunks {
    constructor (options = {}) {
        this.options = options;
    };
    apply (compiler) {
        const plugins = compiler.options.plugins;
        for (let i = 0 ; i < plugins.length ; i++) {
            if (plugins[i].__proto__.constructor === 'HtmlWebpackPlugin') {
                return true;
            } else {
                return false;
            }
        }
    }
};
module.exports = ReadChunks;
```
### 总结：
编写webpack插件，我们需要了解webpack的各个生命周期，以及阅读源码，了解webpack内部api，这样才能在正确的阶段，扩展插件。