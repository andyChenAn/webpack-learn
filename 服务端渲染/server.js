const express = require('express');
const ap = express();
const renderer = require('vue-server-renderer').createRenderer();
const {createApp} = require('./dist/bundle_server.js');
const {app} = createApp();
/**
 * 设置静态资源存放路径
 */
ap.use('/' , express.static(__dirname + '/dist'));

ap.get('/' , (req , res) => {
    renderer.renderToString(app , (err , html) => {
        if (err) {
            res.status(500).send(`
                <h1>Error: ${err.message}</h1>
                <pre>${err.stack}</pre>
            `)
        } else {
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="X-UA-Compatible" content="ie=edge">
                    <title>Document</title>
                    <link rel="stylesheet" href="style.css">
                </head>
                <body>
                    <div id="app">
                        ${html}
                    </div>
                </body>
                </html>
            `)
        }
    });
});

ap.listen(3000 , () => {
    console.log('listening port 3000')
})