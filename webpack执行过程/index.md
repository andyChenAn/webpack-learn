# webpack执行过程
**基于webpack4.0以上版本**

我们都知道webpack是一个打包工具，但是具体是怎么打包呢？它的执行过程是怎么样的呢？可能很多时候我们是搞不清楚的，尤其是对于webpack插件是怎么开发的，就更一头雾水了，反正我就是这样，带着这些疑问，决定看一看webpack的源码，一探究竟。当然本人技术比较菜，只是觉得知其然不知其所以然是一件很痛苦的事情，所以想看看里面是怎么运行的。
#### 当我们在命令行中输入："webpack"时，发生了什么？
我这里就拿vue-cli为例吧，在我们进行vue单页应用开发时，作者已经为我们写好了一个脚手架(vue-cli)，我们可以直接开箱即用，当我们在命令行输入：
```
npm run dev
```
我们在打开"localhost:8080"，就会得到相应的页面内容。但是webpack打包不是执行webpack xxx命令吗？怎么是npm run dev呢？我们可以打开vue-cli的package.json文件，找到scripts字段：
```
  "scripts": {
    "dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js",
    "start": "npm run dev",
    "unit": "jest --config test/unit/jest.conf.js --coverage",
    "test": "npm run unit",
    "build": "node build/build.js"
  },
```
我们发现其实当我们执行npm run dev命令时，其实执行的就是：
```
webpack-dev-server --inline --progress --config build/webpack.dev.conf.js
```
所以最终执行的就是build目录下的webpack.dev.conf.js这个文件。

当我们在命令行中输入webpack命令时，webpack会自动找到目录下的webpack.config.js文件并执行，如果没有webpack.config.js文件，那么我们可以自己定义文件，让webpack来执行，比如，vue-cli中的这个命令：

```
webpack --config build/webpack.dev.conf.js
```

##### 第一步：执行bin/webpack.js
```
let webpackCliInstalled = false;
try {
    // 调用require.resolve()方法检查这个模块是否存在，如果不存在则，会抛出错误
	require.resolve("webpack-cli");
	webpackCliInstalled = true;
} catch (e) {
	webpackCliInstalled = false;
}

if (webpackCliInstalled) {
	require("webpack-cli"); // eslint-disable-line node/no-missing-require, node/no-extraneous-require, node/no-unpublished-require
} else {
	console.error("The CLI moved into a separate package: webpack-cli.");
	console.error(
		"Please install 'webpack-cli' in addition to webpack itself to use the CLI."
	);
	console.error("-> When using npm: npm install webpack-cli -D");
	console.error("-> When using yarn: yarn add webpack-cli -D");
	process.exitCode = 1;
}
```
这个文件的内容还是比较少的，主要做了以下几件事情：
- 调用require.resolve()方法来检查"webpack-cli"模块是否存在
- 如果"webpack-cli"模块存在，则调用require()方法加载该模块，如果"webpack-cli"模块不存在，则提示用户安装"webpack-cli"这个模块，因为在webpack4.0版本之前webpack-cli是封装在webpack中，webpack4之后就把它独立出来了。

##### 第二步：加载webpack-cli模块，执行webpack-cli/bin/webpack.js
```
const yargs = require("yargs").usage(
	"webpack-cli " +
		require("../package.json").version +
		"\n" +
		"Usage: https://webpack.js.org/api/cli/\n" +
		"Usage without config file: webpack <entry> [<entry>] --output [-o] <output>\n" +
		"Usage with config file: webpack"
);

require("./config-yargs")(yargs);
yargs.options({
    // 命令行参数配置
});

//解析命令行参数
yargs.parse(process.argv.slice(2), (err, argv, output) => {
    //...
})
// 判断是否符合 argv 里的参数，并执行该参数的回调
function ifArg (name, fn, init) {...}

// 执行编译函数processOptions
function processOptions () {...}
```
这里主要是做了以下几件事情：
- 通过"yargs"模块设置webpack中用到的命令行参数，这里我们可以使用webpack -h命令查看webpack可以使用的命令行参数
- 通过"yargs"模块解析webpack命令行中传入的命令行参数，并转换格式
- 执行编译函数processOptions

我们来看一下processOptions函数内部代码：

```
function processOptions(options) {
	// process Promise
	// 支持promise风格
	if (typeof options.then === "function") {
		options.then(processOptions).catch(function(err) {
			console.error(err.stack || err);
			process.exit(1); // eslint-disable-line
		});
		return;
	}

	const firstOptions = [].concat(options)[0];
	const statsPresetToOptions = require("webpack").Stats.presetToOptions;

	let outputOptions = options.stats;
	if (
		typeof outputOptions === "boolean" ||
		typeof outputOptions === "string"
	) {
		outputOptions = statsPresetToOptions(outputOptions);
	} else if (!outputOptions) {
		outputOptions = {};
	}
    // ...省略
	if (typeof outputOptions.colors === "undefined")
		outputOptions.colors = require("supports-color").stdout;
	const webpack = require("webpack");

	let lastHash = null;
	let compiler;
	try {
	    // 执行编译
		compiler = webpack(options);
	} catch (err) {
		if (err.name === "WebpackOptionsValidationError") {
			if (argv.color)
				console.error(
					`\u001b[1m\u001b[31m${err.message}\u001b[39m\u001b[22m`
				);
			else console.error(err.message);
			// eslint-disable-next-line no-process-exit
			process.exit(1);
		}

		throw err;
	}

	if (argv.progress) {
		const ProgressPlugin = require("webpack").ProgressPlugin;
		new ProgressPlugin({
			profile: argv.profile
		}).apply(compiler);
	}

	if (outputOptions.infoVerbosity === "verbose") {
		compiler.hooks.beforeCompile.tap("WebpackInfo", compilation => {
			console.log("\nCompilation starting…\n");
		});
		compiler.hooks.afterCompile.tap("WebpackInfo", compilation => {
			console.log("\nCompilation finished\n");
		});
	}
    
    // 执行编译结束后的回调函数
	function compilerCallback(err, stats) {
		if (!options.watch || err) {
			// Do not keep cache anymore
			compiler.purgeInputFileSystem();
		}
		if (err) {
			lastHash = null;
			console.error(err.stack || err);
			if (err.details) console.error(err.details);
			process.exit(1); // eslint-disable-line
		}
		if (outputOptions.json) {
			stdout.write(
				JSON.stringify(stats.toJson(outputOptions), null, 2) + "\n"
			);
		} else if (stats.hash !== lastHash) {
			lastHash = stats.hash;
			const statsString = stats.toString(outputOptions);
			const delimiter = outputOptions.buildDelimiter ? `${outputOptions.buildDelimiter}\n` : "";
			if (statsString) stdout.write(`${statsString}\n${delimiter}`);
		}
		if (!options.watch && stats.hasErrors()) {
			process.exitCode = 2;
		}
	}
	if (firstOptions.watch || options.watch) {
		const watchOptions =
			firstOptions.watchOptions ||
			firstOptions.watch ||
			options.watch ||
			{};
		if (watchOptions.stdin) {
			process.stdin.on("end", function(_) {
				process.exit(); // eslint-disable-line
			});
			process.stdin.resume();
		}
		compiler.watch(watchOptions, compilerCallback);
		if (outputOptions.infoVerbosity !== "none")
			console.log("\nWebpack is watching the files…\n");
	} else compiler.run(compilerCallback);
}
```
其实processOptions函数的内部就是执行webpack编译。

##### 第三步：执行webpack函数，进行编译操作
```
const webpack = (options, callback) => {
	const webpackOptionsValidationErrors = validateSchema(
		webpackOptionsSchema,
		options
	);
	if (webpackOptionsValidationErrors.length) {
		throw new WebpackOptionsValidationError(webpackOptionsValidationErrors);
	}
	let compiler;
	if (Array.isArray(options)) {
		compiler = new MultiCompiler(options.map(options => webpack(options)));
	} else if (typeof options === "object") {
		options = new WebpackOptionsDefaulter().process(options);

		compiler = new Compiler(options.context);
		compiler.options = options;
		new NodeEnvironmentPlugin().apply(compiler);
		if (options.plugins && Array.isArray(options.plugins)) {
			for (const plugin of options.plugins) {
				plugin.apply(compiler);
			}
		}
		compiler.hooks.environment.call();
		compiler.hooks.afterEnvironment.call();
		compiler.options = new WebpackOptionsApply().process(options, compiler);
	} else {
		throw new Error("Invalid argument: options");
	}
	if (callback) {
		if (typeof callback !== "function")
			throw new Error("Invalid argument: callback");
		if (
			options.watch === true ||
			(Array.isArray(options) && options.some(o => o.watch))
		) {
			const watchOptions = Array.isArray(options)
				? options.map(o => o.watchOptions || {})
				: options.watchOptions || {};
			return compiler.watch(watchOptions, callback);
		}
		compiler.run(callback);
	}
	return compiler;
};
```