
const webpack = require('webpack');
module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "path": require.resolve("path-browserify"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "querystring": require.resolve("querystring-es3"),
        "zlib": require.resolve("browserify-zlib"),
        "url": require.resolve("url"),
        "fs": false,
        "@mui/material": false,
        "@mui/icons-material": false,
        "material-ui/core": false,
        "material-ui/core/Collapse": false,
        "material-ui/icons": false,
    })
    config.devtool='eval-source-map';
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    return config;
}
