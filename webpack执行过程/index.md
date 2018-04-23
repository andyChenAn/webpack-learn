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
    // 这里主要是用过ajv库对我们填写的webpack选项的数据进行验证
	const webpackOptionsValidationErrors = validateSchema(
		webpackOptionsSchema,
		options
	);
	// 如果我们写的webpack选项有错误，那么会直接抛出错误
	if (webpackOptionsValidationErrors.length) {
		throw new WebpackOptionsValidationError(webpackOptionsValidationErrors);
	}
	let compiler;
	// 传入的是一个对象还是一个数组（数组中包含多个对象）
	// 一般我们都传入的是一个对象，即webpack.config.js中导出的那个webpack配置对象
	if (Array.isArray(options)) {
		compiler = new MultiCompiler(options.map(options => webpack(options)));
	} else if (typeof options === "object") {
		options = new WebpackOptionsDefaulter().process(options);
        // 实例化一个 Compiler，Compiler 会继承一个 Tapable 插件框架
		compiler = new Compiler(options.context);
		compiler.options = options;
		new NodeEnvironmentPlugin().apply(compiler);
		
		// 如果plugins选项存在插件，那么依次调用插件
		if (options.plugins && Array.isArray(options.plugins)) {
			for (const plugin of options.plugins) {
				plugin.apply(compiler);
			}
		}
		compiler.hooks.environment.call();
		compiler.hooks.afterEnvironment.call();
		// 实例化一个 WebpackOptionsApply 来编译处理 webpack 编译对象
		// 调用WebpackOptionsApply实例的process方法，来对我们传入的webpack编译对象进行编译
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
当调用webpack()函数，其实内部做了以下几件事情：
- 通过ajv库来验证webpack配置对象的数据是否正确，webpack内部定义了所有webpack配置项的数据结构，采用的是JSON Schema规范来定义的，而ajv库就是用来检验这种数据结构的是否正确,对于ajv库，我们可以[参考这篇文章](http://imweb.io/topic/57b5f69373ac222929653f23)，这里举个简单的例子：

```
const Ajv = require('ajv');
let schema = {
  type: 'object',
  required: ['username', 'email', 'password'],
  properties: {
    username: {
      type: 'string',
      minLength: 4
    },
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 6
    },
    age: {
      type: 'integer',
      minimum: 0
    },
    sex: {
      enum: ['boy', 'girl', 'secret'],
      default: 'secret'
    },
  }
};
let ajv = new Ajv();
let validate = ajv.compile(schema);
let valid = validate({username : 'andy' , password : '5464564' , email : '23423452@qq.com'});
if (!valid) console.log(validate.errors);
```
- 首先调用new WebpackOptionsDefaulter()，实例化一个WebpackOptionsDefaulter对象，用来处理默认配置项，说白了就是设置webpack的默认配置项，调用process方法就是用来设置我们自己填写的webpack配置参数，说白了就是覆盖之前的默认配置参数。
源码如下：

```
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const getProperty = (obj, name) => {
	name = name.split(".");
	for (let i = 0; i < name.length - 1; i++) {
		obj = obj[name[i]];
		if (typeof obj !== "object" || !obj || Array.isArray(obj)) return;
	}
	return obj[name.pop()];
};

const setProperty = (obj, name, value) => {
	name = name.split(".");
	for (let i = 0; i < name.length - 1; i++) {
		if (typeof obj[name[i]] !== "object" && typeof obj[name[i]] !== "undefined")
			return;
		if (Array.isArray(obj[name[i]])) return;
		if (!obj[name[i]]) obj[name[i]] = {};
		obj = obj[name[i]]; 
	}
	obj[name.pop()] = value;
};

class OptionsDefaulter {
	constructor() {
		this.defaults = {};
		this.config = {};
	}

	process(options) {
		options = Object.assign({}, options);
		for (let name in this.defaults) {
			switch (this.config[name]) {
				case undefined:
					if (getProperty(options, name) === undefined)
						setProperty(options, name, this.defaults[name]);
					break;
				case "call":
					setProperty(
						options,
						name,
						this.defaults[name].call(this, getProperty(options, name), options),
						options
					);
					break;
				case "make":
					if (getProperty(options, name) === undefined)
						setProperty(
							options,
							name,
							this.defaults[name].call(this, options),
							options
						);
					break;
				case "append": {
					let oldValue = getProperty(options, name);
					if (!Array.isArray(oldValue)) oldValue = [];
					oldValue.push(...this.defaults[name]);
					setProperty(options, name, oldValue);
					break;
				}
				default:
					throw new Error(
						"OptionsDefaulter cannot process " + this.config[name]
					);
			}
		}
		return options;
	}

	set(name, config, def) {
		if (def !== undefined) {
			this.defaults[name] = def;
			this.config[name] = config;
		} else {
			this.defaults[name] = config;
			delete this.config[name];
		}
	}
}
module.exports = OptionsDefaulter;
```
- 实例化WebpackOptionsApply对象，并调用该实例的process方法来处理传入webpack的编译对象。

```
class WebpackOptionsApply extends OptionsApply {
	constructor() {
		super();
	}

	process(options, compiler) {
		let ExternalsPlugin;
		// 缓冲输入输出的目录地址
		compiler.outputPath = options.output.path;
		compiler.recordsInputPath = options.recordsInputPath || options.recordsPath;
		compiler.recordsOutputPath =
			options.recordsOutputPath || options.recordsPath;
		compiler.name = options.name;
		compiler.dependencies = options.dependencies;
		// 处理target属性，这个属性决定了我们打包后的文件应该运行的环境
		// 比如：web,node等
		if (typeof options.target === "string") {
			let JsonpTemplatePlugin;
			let FetchCompileWasmTemplatePlugin;
			let ReadFileCompileWasmTemplatePlugin;
			let NodeSourcePlugin;
			let NodeTargetPlugin;
			let NodeTemplatePlugin;

			switch (options.target) {
				case "web":
					JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
					FetchCompileWasmTemplatePlugin = require("./web/FetchCompileWasmTemplatePlugin");
					NodeSourcePlugin = require("./node/NodeSourcePlugin");
					new JsonpTemplatePlugin(options.output).apply(compiler);
					new FetchCompileWasmTemplatePlugin(options.output).apply(compiler);
					new FunctionModulePlugin(options.output).apply(compiler);
					new NodeSourcePlugin(options.node).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					break;
				case "webworker": {
					let WebWorkerTemplatePlugin = require("./webworker/WebWorkerTemplatePlugin");
					FetchCompileWasmTemplatePlugin = require("./web/FetchCompileWasmTemplatePlugin");
					NodeSourcePlugin = require("./node/NodeSourcePlugin");
					new WebWorkerTemplatePlugin().apply(compiler);
					new FetchCompileWasmTemplatePlugin(options.output).apply(compiler);
					new FunctionModulePlugin(options.output).apply(compiler);
					new NodeSourcePlugin(options.node).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					break;
				}
				case "node":
				case "async-node":
					NodeTemplatePlugin = require("./node/NodeTemplatePlugin");
					ReadFileCompileWasmTemplatePlugin = require("./node/ReadFileCompileWasmTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					new NodeTemplatePlugin({
						asyncChunkLoading: options.target === "async-node"
					}).apply(compiler);
					new ReadFileCompileWasmTemplatePlugin(options.output).apply(compiler);
					new FunctionModulePlugin(options.output).apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new LoaderTargetPlugin("node").apply(compiler);
					break;
				case "node-webkit":
					JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					ExternalsPlugin = require("./ExternalsPlugin");
					new JsonpTemplatePlugin(options.output).apply(compiler);
					new FunctionModulePlugin(options.output).apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new ExternalsPlugin("commonjs", "nw.gui").apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					break;
				case "electron-main":
					NodeTemplatePlugin = require("./node/NodeTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					ExternalsPlugin = require("./ExternalsPlugin");
					new NodeTemplatePlugin({
						asyncChunkLoading: true
					}).apply(compiler);
					new FunctionModulePlugin(options.output).apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new ExternalsPlugin("commonjs", [
						"app",
						"auto-updater",
						"browser-window",
						"clipboard",
						"content-tracing",
						"crash-reporter",
						"dialog",
						"electron",
						"global-shortcut",
						"ipc",
						"ipc-main",
						"menu",
						"menu-item",
						"native-image",
						"original-fs",
						"power-monitor",
						"power-save-blocker",
						"protocol",
						"screen",
						"session",
						"shell",
						"tray",
						"web-contents"
					]).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					break;
				case "electron-renderer":
					JsonpTemplatePlugin = require("./web/JsonpTemplatePlugin");
					NodeTargetPlugin = require("./node/NodeTargetPlugin");
					ExternalsPlugin = require("./ExternalsPlugin");
					new JsonpTemplatePlugin(options.output).apply(compiler);
					new FunctionModulePlugin(options.output).apply(compiler);
					new NodeTargetPlugin().apply(compiler);
					new ExternalsPlugin("commonjs", [
						"clipboard",
						"crash-reporter",
						"desktop-capturer",
						"electron",
						"ipc",
						"ipc-renderer",
						"native-image",
						"original-fs",
						"remote",
						"screen",
						"shell",
						"web-frame"
					]).apply(compiler);
					new LoaderTargetPlugin(options.target).apply(compiler);
					break;
				default:
					throw new Error("Unsupported target '" + options.target + "'.");
			}
		} else if (options.target !== false) {
			options.target(compiler);
		} else {
			throw new Error("Unsupported target '" + options.target + "'.");
		}
        
        // 处理library属性，该属性表示导出的库的名称
		if (options.output.library || options.output.libraryTarget !== "var") {
			let LibraryTemplatePlugin = require("./LibraryTemplatePlugin");
			new LibraryTemplatePlugin(
				options.output.library,
				options.output.libraryTarget,
				options.output.umdNamedDefine,
				options.output.auxiliaryComment || "",
				options.output.libraryExport
			).apply(compiler);
		}
		// 处理 externals 属性，告诉 webpack 不要遵循/打包这些模块，而是在运行时从环境中请求他们
		if (options.externals) {
			ExternalsPlugin = require("./ExternalsPlugin");
			new ExternalsPlugin(
				options.output.libraryTarget,
				options.externals
			).apply(compiler);
		}

		let noSources;
		let legacy;
		let modern;
		let comment;
		// 处理devtool属性，该属性表示webpack的sourceMap模式
		if (
			options.devtool &&
			(options.devtool.includes("sourcemap") ||
				options.devtool.includes("source-map"))
		) {
			const hidden = options.devtool.includes("hidden");
			const inline = options.devtool.includes("inline");
			const evalWrapped = options.devtool.includes("eval");
			const cheap = options.devtool.includes("cheap");
			const moduleMaps = options.devtool.includes("module");
			noSources = options.devtool.includes("nosources");
			legacy = options.devtool.includes("@");
			modern = options.devtool.includes("#");
			comment =
				legacy && modern
					? "\n/*\n//@ source" +
						"MappingURL=[url]\n//# source" +
						"MappingURL=[url]\n*/"
					: legacy
						? "\n/*\n//@ source" + "MappingURL=[url]\n*/"
						: modern ? "\n//# source" + "MappingURL=[url]" : null;
			let Plugin = evalWrapped
				? EvalSourceMapDevToolPlugin
				: SourceMapDevToolPlugin;
			new Plugin({
				filename: inline ? null : options.output.sourceMapFilename,
				moduleFilenameTemplate: options.output.devtoolModuleFilenameTemplate,
				fallbackModuleFilenameTemplate:
					options.output.devtoolFallbackModuleFilenameTemplate,
				append: hidden ? false : comment,
				module: moduleMaps ? true : cheap ? false : true,
				columns: cheap ? false : true,
				lineToLine: options.output.devtoolLineToLine,
				noSources: noSources,
				namespace: options.output.devtoolNamespace
			}).apply(compiler);
		} else if (options.devtool && options.devtool.includes("eval")) {
			legacy = options.devtool.includes("@");
			modern = options.devtool.includes("#");
			comment =
				legacy && modern
					? "\n//@ sourceURL=[url]\n//# sourceURL=[url]"
					: legacy
						? "\n//@ sourceURL=[url]"
						: modern ? "\n//# sourceURL=[url]" : null;
			new EvalDevToolModulePlugin({
				sourceUrlComment: comment,
				moduleFilenameTemplate: options.output.devtoolModuleFilenameTemplate,
				namespace: options.output.devtoolNamespace
			}).apply(compiler);
		}
        
        // 以下就是调用各种webpack插件，说实话真的很多
		new JavascriptModulesPlugin().apply(compiler);
		new JsonModulesPlugin().apply(compiler);
		new WebAssemblyModulesPlugin().apply(compiler);
        
        // 调用该插件，触发entry入口文件
		new EntryOptionPlugin().apply(compiler);
		// 触发entryOption事件
		compiler.hooks.entryOption.call(options.context, options.entry);

		new CompatibilityPlugin().apply(compiler);
		new HarmonyModulesPlugin(options.module).apply(compiler);
		new AMDPlugin(options.module, options.amd || {}).apply(compiler);
		new CommonJsPlugin(options.module).apply(compiler);
		new LoaderPlugin().apply(compiler);
		new NodeStuffPlugin(options.node).apply(compiler);
		new RequireJsStuffPlugin().apply(compiler);
		new APIPlugin().apply(compiler);
		new ConstPlugin().apply(compiler);
		new UseStrictPlugin().apply(compiler);
		new RequireIncludePlugin().apply(compiler);
		new RequireEnsurePlugin().apply(compiler);
		new RequireContextPlugin(
			options.resolve.modules,
			options.resolve.extensions,
			options.resolve.mainFiles
		).apply(compiler);
		new ImportPlugin(options.module).apply(compiler);
		new SystemPlugin(options.module).apply(compiler);

		if (typeof options.mode !== "string")
			new WarnNoModeSetPlugin().apply(compiler);

		new EnsureChunkConditionsPlugin().apply(compiler);
		if (options.optimization.removeAvailableModules)
			new RemoveParentModulesPlugin().apply(compiler);
		if (options.optimization.removeEmptyChunks)
			new RemoveEmptyChunksPlugin().apply(compiler);
		if (options.optimization.mergeDuplicateChunks)
			new MergeDuplicateChunksPlugin().apply(compiler);
		if (options.optimization.flagIncludedChunks)
			new FlagIncludedChunksPlugin().apply(compiler);
		if (options.optimization.occurrenceOrder)
			new OccurrenceOrderPlugin(true).apply(compiler);
		if (options.optimization.sideEffects)
			new SideEffectsFlagPlugin().apply(compiler);
		if (options.optimization.providedExports)
			new FlagDependencyExportsPlugin().apply(compiler);
		if (options.optimization.usedExports)
			new FlagDependencyUsagePlugin().apply(compiler);
		if (options.optimization.concatenateModules)
			new ModuleConcatenationPlugin().apply(compiler);
		if (options.optimization.splitChunks)
			new SplitChunksPlugin(options.optimization.splitChunks).apply(compiler);
		if (options.optimization.runtimeChunk)
			new RuntimeChunkPlugin(options.optimization.runtimeChunk).apply(compiler);
		if (options.optimization.noEmitOnErrors)
			new NoEmitOnErrorsPlugin().apply(compiler);
		if (options.optimization.namedModules)
			new NamedModulesPlugin().apply(compiler);
		if (options.optimization.namedChunks)
			new NamedChunksPlugin().apply(compiler);
		if (options.optimization.nodeEnv) {
			new DefinePlugin({
				"process.env.NODE_ENV": JSON.stringify(options.optimization.nodeEnv)
			}).apply(compiler);
		}
		if (options.optimization.minimize) {
			for (const minimizer of options.optimization.minimizer) {
				minimizer.apply(compiler);
			}
		}

		if (options.performance) {
			new SizeLimitsPlugin(options.performance).apply(compiler);
		}

		new TemplatedPathPlugin().apply(compiler);

		new RecordIdsPlugin({
			portableIds: options.optimization.portableRecords
		}).apply(compiler);

		new WarnCaseSensitiveModulesPlugin().apply(compiler);

		if (options.cache) {
			let CachePlugin = require("./CachePlugin");
			new CachePlugin(
				typeof options.cache === "object" ? options.cache : null
			).apply(compiler);
		}

		compiler.hooks.afterPlugins.call(compiler);
		if (!compiler.inputFileSystem)
			throw new Error("No input filesystem provided");
		compiler.resolverFactory.hooks.resolveOptions
			.for("normal")
			.tap("WebpackOptionsApply", resolveOptions => {
				return Object.assign(
					{
						fileSystem: compiler.inputFileSystem
					},
					options.resolve,
					resolveOptions
				);
			});
		compiler.resolverFactory.hooks.resolveOptions
			.for("context")
			.tap("WebpackOptionsApply", resolveOptions => {
				return Object.assign(
					{
						fileSystem: compiler.inputFileSystem,
						resolveToContext: true
					},
					options.resolve,
					resolveOptions
				);
			});
		compiler.resolverFactory.hooks.resolveOptions
			.for("loader")
			.tap("WebpackOptionsApply", resolveOptions => {
				return Object.assign(
					{
						fileSystem: compiler.inputFileSystem
					},
					options.resolveLoader,
					resolveOptions
				);
			});
		compiler.hooks.afterResolvers.call(compiler);
		// 返回处理过的编译对象options
		return options;
	}
}
```
### 总结：
- 1、执行 bin 目录下的 webpack.js 脚本，解析命令行参数以及开始执行编译。
- 2、调用 lib 目录下的 webpack.js 文件的核心函数 webpack ，实例化一个 Compiler，继承 Tapable 插件框架，实现注册和调用一系列插件。
- 3、调用 lib 目录下的 /WebpackOptionsApply.js 模块的 process 方法，使用各种各样的插件来逐一编译 webpack 编译对象的各项。
- 4、在3中调用的各种插件编译并输出新文件。


[参考这里](https://github.com/DDFE/DDFE-blog/issues/12#ref-issue-205307666)

[这里讲的更详细](https://fengmiaosen.github.io/2017/03/21/webpack-core-code/)