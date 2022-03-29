const WebpackAutoInject = require("webpack-auto-inject-version")
const Dotenv = require("dotenv-webpack")

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    plugins: [
      new Dotenv(),
      new WebpackAutoInject({
        // specify the name of the tag in the outputed files eg
        // bundle.js: [SHORT] Version: 0.13.36 ...
        SHORT: "Troplo Versioning [BetterCompass]",
        SILENT: false,
        PACKAGE_JSON_PATH: "./package.json",
        PACKAGE_JSON_INDENT: 4,
        components: {
          AutoIncreaseVersion: true,
          InjectAsComment: true,
          InjectByTag: true
        },
        componentsOptions: {
          AutoIncreaseVersion: {
            runInWatchMode: true // it will increase version with every single build!
          },
          InjectAsComment: {
            tag: "Version information: {version}, Build Date: {date}",
            dateFormat: "dd/mm/yyyy; hh:MM:ss TT", // change timezone: `UTC:h:MM:ss` or `GMT:h:MM:ss`
            multiLineCommentType: false // use `/** */` instead of `//` as comment block
          },
          InjectByTag: {
            fileRegex: /\.+/,
            AIVTagRegexp: /(\[AIV])(([a-zA-Z{} ,:;!()_@\-"'\\\/])+)(\[\/AIV])/g,
            dateFormat: "dd/mm/yyyy; hh:MM:ss TT"
          }
        },
        LOGS_TEXT: {
          AIS_START: "Troplo AIV started"
        }
      })
    ]
  },
  pwa: {
    workboxOptions: {
      skipWaiting: true
    },
    name: "BetterCompass",
    themeColor: "#181818",
    msTileColor: "#181818",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    mobileWebAppCapable: "yes"
  },
  devServer: {
    proxy: "http://localhost:23994"
  },
  transpileDependencies: ["vuetify"]
}
