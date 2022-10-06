const express = require("express");
const cors = require("cors");
const baseRouter = require("./src/core/common/routerModuleMapper");
const initializeMongo = require("./src/repository/mongodb/mongooseClient");
const app = express();
const dotenv = require("dotenv").config();

app.use(
  cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.options(
  process.env.PORTAL_URL,
  cors({
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/", baseRouter);

app.listen(process.env.PORT || 3010, () => {
  initializeMongo();
  console.log("App is running on port 3010");
});
