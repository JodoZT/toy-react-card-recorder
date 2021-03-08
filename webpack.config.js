const path = require("path");

module.exports = {
    entry: './js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'indexbundle.js'
    },
    module:{
        rules:[
            {
                test: /\.js$/,
                use: 'babel-loader'
            }
        ]
    },
    devtool:"eval-cheap-module-source-map",
    devServer:{
        writeToDisk: true
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};