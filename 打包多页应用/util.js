const path = require('path');
const glob = require('glob');
/**
 * 查找入口文件函数
 */
function findEntry (_path) {
    let files = glob.sync(_path);
    let keys = [] , values = [] , entryObject = {};
    files.map((file , index) => {
        keys.push(file.split('/')[2]);
        values.push(file);
    });
    keys.map((key , index) => {
        entryObject[key] = values[index];
    });
    return entryObject;
};

/**
 * 自动生成html文件函数
 */
function createHtml (_path , HtmlWebpackPlugin) {
    let entryObject = findEntry(_path);
    let plugins = [];
    for (let key in entryObject) {
        plugins.push(new HtmlWebpackPlugin({
            title : key,
            template : `./src/${key}/${key}.html`,
            filename : `${key}.html`,
            chunks : [`${key}`]
        }))
    };
    return plugins;
};

exports.findEntry = findEntry;
exports.createHtml = createHtml;
