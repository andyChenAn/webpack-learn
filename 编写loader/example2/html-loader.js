const fs = require('fs');
const path = require('path');
const aa = {
    content : '{{__content__}}'
}

/**
 * 
 * @param {String} htmlPath 文件路径
 * @param {Object} aa 对象
 * @param {String} source 要替换的内容
 */
function htmlRender (htmlPath , aa , source) {
    let html = '';
    try {
        html = fs.readFileSync(htmlPath , 'utf8');
    } catch (err) {
        throw err;
    }
    return JSON.stringify(html.replace(aa.content , source));
};
/**
 * 
 * @param {String} source 加载资源的字符串内容
 */
function htmlLoader (source) {
    this.cacheable();
    const reg = /@layout\((.*?)\)/g;
    const regResult = reg.exec(source);
    if (regResult) {
        // 获取需要读取的文件的路径
        const url = regResult[1];
        // 将匹配的内容替换为空
        source = source.replace(regResult[0] , '');
        // 读取指定路径的文件内容，并替换相应内容
        const json = htmlRender(url , aa , source);
        // 返回数据
        return `module.exports = ${json}`;
    }
};

module.exports = htmlLoader;