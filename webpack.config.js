const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// process.traceDeprecation = true;
// markdown convert to html
var marked = require('marked');
var renderer = new marked.Renderer();

const path = require('path');
const join = path.join;

module.exports = function(env) {
  const config = {
    entry: {
      background_page: './src/background_page/index.js',
      toggle_saka: './src/content_script/toggle_saka.js',
      // 'extensions': './src/pages/extensions/index.js',
      // 'info': './src/pages/info/index.js',
      // 'options': './src/pages/options/index.js',
      saka: './src/saka/index.js',
      'saka-options': './src/options/saka-options.js'
    },
    output: {
      path: __dirname + '/dist',
      filename: '[name].js',
      sourceMapFilename: '[name].js.map'
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            // require.resolve needed to work with linked modules
            // (e.g. saka-action in development) or build will fail
            // presets: [require.resolve('babel-preset-stage-3')]
          }
        },
        {
          test: /\.(sc|c)ss$/,
          use: [
            'style-loader',
            { loader: 'css-loader' },
            {
              loader: 'sass-loader',
              options: {
                importer: function(url, prev) {
                  if (url.indexOf('@material') === 0) {
                    var filePath = url.split('@material')[1];
                    var nodeModulePath = `./node_modules/@material/${filePath}`;
                    return { file: require('path').resolve(nodeModulePath) };
                  }
                  return { file: url };
                }
              }
            }
          ]
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'html-loader'
            },
            {
              loader: 'markdown-loader',
              options: {
                renderer
              }
            }
          ]
        }
      ]
    },
    resolve: {
      alias: {
        src: path.join(__dirname, 'src'),
        msg: path.join(__dirname, 'src/msg'),
        suggestion_engine: path.join(__dirname, 'src/suggestion_engine'),
        suggestion_utils: path.join(__dirname, 'src/suggestion_utils'),
        lib: path.join(__dirname, 'src/lib'),
        scss: path.join(__dirname, 'src/scss')
      },
      modules: ['./src', './node_modules']
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new CopyWebpackPlugin([
        {
          from: 'static'
        },
        {
          context: 'src/modes',
          from: '**/default.json',
          to: 'default_[folder].json'
        },
        {
          context: 'src/modes',
          from: '**/config.json',
          to: 'config_[folder].json'
        }
      ])
    ]
  };

  const [mode, platform, benchmark] = env.split(':');
  const version = require('./static/manifest.json').version;
  // mode controls:
  // 1. SAKA_DEBUG: boolean(true | false)
  //   * true for development builds
  //   * false for production build
  //   If you want something to run only in testing/development, use
  //     if (SAKA_DEBUG) { console.log(variable); }.
  //   All code within will be removed at build time in production builds.
  // platform controls:
  // 1. SAKA_PLATFORM: string('chrome' | 'firefox' | 'edge')
  //   Use this to provide platform specific features, e.g. use shadow DOM
  //   on chrome but css selectors on firefox and edge for link hint styling

  if (mode === 'prod') {
    config.plugins = config.plugins.concat([
      new BabiliPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        SAKA_DEBUG: JSON.stringify(false),
        SAKA_VERSION: JSON.stringify(version),
        SAKA_PLATFORM: JSON.stringify(platform),
        SAKA_BENCHMARK: JSON.stringify(true)
      })
    ]);
  } else {
    config.devtool = 'source-map';
    config.plugins = config.plugins.concat([
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
        SAKA_DEBUG: JSON.stringify(true),
        SAKA_VERSION: JSON.stringify(version + ' dev'),
        SAKA_PLATFORM: JSON.stringify(platform),
        SAKA_BENCHMARK: JSON.stringify(benchmark === 'benchmark')
      })
    ]);
  }
  return config;
};
