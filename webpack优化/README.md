# webpack优化
对webpack进行优化，主要是两方面，一方面是优化开发体验，另一方面是优化输出质量，优化开发体验，主要指的就是构建速度，而优化输出质量，主要指的就是减少首屏加载时间等。
#### 1、优化webpack配置项loader
优化loader，主要是通过loader选项中的三个属性来实现，分别是：test，exclude，include，通过对exclude和include的配置，可以让我们知道再哪些地方需要执行加载器，哪些地方不需要，避免所有的匹配的文件都会通过loader来执行。
#### 2、优化webpack配置项resolve.module
在解析第三方模块时，webpack通过查找"node_modules"目录下的具体模块来解析，如何"node_modules"目录不存在该模块，那么就向上一级的"node_modules"目录查找，这个查找过程和nodejs的模块解析比较类似，一般来说，我们都会将第三方模块按照在根目录下的"node_modules"目录下，所以我们执行需要指定为这个目录，那么webpack在执行的时候，就不会向上查找了。
#### 3、优化webpack配置项resolve.mainFields

#### 4、优化webpack配置项resolve.alias
#### 5、优化webpack配置项resolve.extensions
#### 6、优化webpack配置项module.noParse
#### 7、使用DllPlugin