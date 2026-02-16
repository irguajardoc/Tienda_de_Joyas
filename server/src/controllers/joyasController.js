const { getJoyas, getJoyasByFilters } = require("../models/joyasModel");
const { prepararHATEOAS } = require("../utils/hateoas");

const listarJoyasHATEOAS = async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await getJoyas(queryStrings);
    const hateoas = prepararHATEOAS(joyas, { basePath: "/joyas/joya" });
    return res.json(hateoas);
  } catch (error) {
    console.error("Error en listarJoyasHATEOAS:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

const filtrarJoyas = async (req, res) => {
  try {
    const queryStrings = req.query;
    const joyas = await getJoyasByFilters(queryStrings);
    return res.json(joyas);
  } catch (error) {
    console.error("Error en filtrarJoyas:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { listarJoyasHATEOAS, filtrarJoyas };
