console.log("Initializing")
require("dotenv").config()
let express = require("express")
let app = express()
//Middle-ware
let bodyParser = require("body-parser")
let os = require("os")
let axios = require("axios")
const { createProxyMiddleware } = require("http-proxy-middleware")
const cookieParser = require("cookie-parser")
app.use(cookieParser())
app.set("trust proxy", true)
const { Feedback } = require("./models")
const compassRouter = function (req) {
  const instance =
    req.header("compassInstance") || req.query.forceInstance || "devices"
  console.log("Instance: " + instance)
  // this is to avoid the ability to proxy non Compass sites through the proxy.
  if (instance.match(/^[a-zA-Z0-9-]+$/)) {
    return "https://" + instance + ".compass.education"
  } else {
    console.log("Test failed: " + "https://" + instance + ".compass.education")
    return "https://devices.compass.education"
  }
}
app.use(function (req, res, next) {
  if (req.header("compassSchoolId")) {
    res.cookie(
      "cpssid_" + req.header("compassSchoolId"),
      req.cookies["cpssid_" + req.header("compassSchoolId")],
      {
        expires: new Date(253402300000000),
        httpOnly: true,
        secure: true,
        domain: process.env.HOSTNAME
      }
    )
  }
  if (req.cookies["ASP.NET_SessionId"]) {
    res.cookie("ASP.NET_SessionId", req.cookies["ASP.NET_SessionId"], {
      expires: new Date(253402300000000),
      httpOnly: true,
      secure: true,
      domain: process.env.HOSTNAME
    })
  }
  res.header("Access-Control-Allow-Origin", process.env.HOSTNAME)
  res.header("Access-Control-Allow-Methods", "*")
  res.header(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers")
  )
  next()
})

app.use(
  "/Services",
  createProxyMiddleware({
    target: "devices.compass.education",
    router: compassRouter,
    changeOrigin: true,
    cookieDomainRewrite: process.env.HOSTNAME
  })
)

app.use(
  "/services",
  createProxyMiddleware({
    target: "devices.compass.education",
    router: compassRouter,
    changeOrigin: true,
    cookieDomainRewrite: process.env.HOSTNAME
  })
)

app.use(
  "/download",
  createProxyMiddleware({
    target: "devices.compass.education",
    router: compassRouter,
    changeOrigin: true,
    cookieDomainRewrite: process.env.HOSTNAME
  })
)

app.use(
  "/Assets*",
  createProxyMiddleware({
    target: "devices.compass.education",
    router: compassRouter,
    changeOrigin: true,
    cookieDomainRewrite: process.env.HOSTNAME
  })
)

app.use(
  "/graphql",
  createProxyMiddleware({
    target: "devices.compass.education",
    router: compassRouter,
    changeOrigin: true,
    cookieDomainRewrite: process.env.HOSTNAME
  })
)

app.use(bodyParser.json({ limit: "5mb" }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/api/v1/user", require("./routes/user.js"))
app.use("/api/v1/themes", require("./routes/theme.js"))
app.get("/api/v1/state", async (req, res) => {
  res.json({
    release: process.env.RELEASE,
    loading: true,
    notification: process.env.NOTIFICATION,
    latestVersion: require("../package.json").version
  })
})

app.post("/api/v1/feedback", async (req, res) => {
  try {
    await Feedback.create({
      feedbackText: req.body.text,
      starRating: req.body.starRating,
      debug: {
        client: req.body.debug,
        ip: req.header("x-real-ip") || req.ip
      },
      route: req.body.route,
      userId: req.body.sussiId,
      tenant:
        req.header("compassInstance") || req.query.forceInstance || "unknown"
    })
    res.sendStatus(204)
  } catch (e) {
    res.status(500)
    res.json({
      error: e.message
    })
  }
})

app.get("/api/v1/weather", (req, res) => {
  try {
    axios
      .get("http://ip-api.com/json/" + req.header("x-real-ip") || req.ip)
      .then((response1) => {
        console.log(response1.data)
        axios
          .get(
            "https://api.openweathermap.org/data/2.5/weather?lat=" +
              response1.data.lat +
              "&lon=" +
              response1.data.lon +
              "&appid=cc89e60155163ce2bbd7a7a5e3ca413b&units=metric"
          )
          .then((response2) => {
            res.send(response2.data)
          })
          .catch((error) => {
            res.send(error.response.data)
          })
      })
      .catch(() => {
        res.json({ success: false })
      })
  } catch (e) {
    res.status(500).send(e)
  }
})

app.all("/api/*", (req, res) => {
  res.status(404).json({
    message: "This is reserved, and cannot be proxied through Compass."
  })
})

console.log(os.hostname())

if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "production") {
  app.use(require("morgan")("dev"))
}
app.use(require("./lib/errorHandler"))
function main() {
  app.listen(23994, () => {
    console.log("Initialized")
    console.log("Listening on port 0.0.0.0:" + 23994)

    app.locals.appStarted = true
    app.emit("appStarted")
  })
}
if (process.env.NODE_ENV === "test") {
} else {
  main()
}
module.exports = app
