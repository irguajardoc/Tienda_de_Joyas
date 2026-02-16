
const pool = require("../config/db");
const format = require("pg-format");

const ALLOWED_ORDER_FIELDS = new Set(["id", "nombre", "categoria", "metal", "precio", "stock"]);


const getJoyas = async ({ limits = 10, page = 1, order_by = "id_ASC" } = {}) => {
  try {
    
    const numericLimits = Number(limits);
    const numericPage = Number(page);

    const safeLimits = Number.isFinite(numericLimits) && numericLimits > 0 ? numericLimits : 10;
    const safePage = Number.isFinite(numericPage) && numericPage > 0 ? numericPage : 1;

    const [campoRaw, direccionRaw] = String(order_by).split("_");
    const campo = campoRaw?.toLowerCase() || "id";
    const direccion = (direccionRaw || "ASC").toUpperCase();

    const safeCampo = ALLOWED_ORDER_FIELDS.has(campo) ? campo : "id";
    const safeDireccion = direccion === "DESC" ? "DESC" : "ASC";

    const offset = (safePage - 1) * safeLimits;

    const query = format(
      "SELECT * FROM inventario ORDER BY %I %s LIMIT %L OFFSET %L",
      safeCampo,
      safeDireccion,
      safeLimits,
      offset
    );

    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};
const getJoyasByFilters = async ({ precio_max, precio_min, categoria, metal } = {}) => {
  try {
    let filters = [];
    const values = [];

    const addFilter = (field, operator, value) => {
      values.push(value);
      filters.push(`${field} ${operator} $${values.length}`);
    };

    const hasMin = precio_min !== undefined && precio_min !== null && precio_min !== "";
    const hasMax = precio_max !== undefined && precio_max !== null && precio_max !== "";

    if (hasMin && hasMax) {
      let min = Number(precio_min);
      let max = Number(precio_max);

      
      if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
        [min, max] = [max, min];
      }

      if (!Number.isNaN(min)) addFilter("precio", ">=", min);
      if (!Number.isNaN(max)) addFilter("precio", "<=", max);
    } else {
      if (hasMin && !Number.isNaN(Number(precio_min))) addFilter("precio", ">=", Number(precio_min));
      if (hasMax && !Number.isNaN(Number(precio_max))) addFilter("precio", "<=", Number(precio_max));
    }
    if (categoria) addFilter("categoria", "=", String(categoria));
    if (metal) addFilter("metal", "=", String(metal));

    let query = "SELECT * FROM inventario";
    if (filters.length > 0) query += ` WHERE ${filters.join(" AND ")}`;

    const { rows } = await pool.query(query, values);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = { getJoyas, getJoyasByFilters };
