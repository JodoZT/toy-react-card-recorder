const path = require("path");

module.exports = {
    entry: './js/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'indexbundle.js'
    },
    module:{
        rules:[
            {
                test: /\.tsx$/,
                use: 'babel-loader'
            },
            {
                test: /\.js$/,
                use: 'source-map-loader',
                enforce: "pre"
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
    },
    resolve: {
        extensions: [".js", "jsx", ".json", ".ts", ".tsx"],
    },
};