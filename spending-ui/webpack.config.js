// webpack.config.js
module.exports = {
    devtool: '#eval-source-map',
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser"
        }),
    ]
};
