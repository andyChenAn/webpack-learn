const loaderUtils = require('loader-utils');
module.exports = function (source) {
    const json = JSON.stringify(source);
    return `module.exports = ${json}`;
}