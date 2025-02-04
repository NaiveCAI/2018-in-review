const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// const OptimizeThreePlugin = require('@vxna/optimize-three-webpack-plugin')
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    entry: [ './src/js/main.js' ],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/[name].[hash].js',
        clean:  true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'raw-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'glslify-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                  devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                  'css-loader',
                  'sass-loader',
                ],
            },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, use: ['url-loader?limit=100000'] }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: true,
        }),
        new webpack.HotModuleReplacementPlugin(), // Enable HMR
        new BrowserSyncPlugin(
            {
                host: 'localhost',
                port: 3001,
                proxy: 'http://localhost:8080/',
                open: false,
                files: [
                    {
                        match: ['**/*.html'],
                        fn: event => {
                            if (event === 'change') {
                                const bs = require('browser-sync').get(
                                    'bs-webpack-plugin'
                                )
                                bs.reload()
                            }
                        }
                    }
                ]
            },
            {
                reload: false
            }
        ),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
        })
        // new OptimizeThreePlugin()
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
    },
    // devtool: devMode ? 'cheap-eval-source-map' : false,
    // devtool: devMode ? 'eval-cheap-module-source-map' : 'source-map',
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                      const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                      return `npm.${packageName.replace('@', '')}`;
                    },
                }
            }
        },
        moduleIds: 'deterministic', // 使用确定性的模块ID
    }
}
