
const express = require("express");
const router = express.Router();

const { activityLogger } = require("../middlewares/activityLogger");
const { listarJoyasHATEOAS, filtrarJoyas } = require("../controllers/joyasController");

router.use(activityLogger);

router.get("/", listarJoyasHATEOAS);

router.get("/filtros", filtrarJoyas);

module.exports = router;
