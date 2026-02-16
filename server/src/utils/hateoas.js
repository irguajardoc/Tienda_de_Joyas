
const prepararHATEOAS = (joyas, { basePath = "/joyas/joya" } = {}) => {
  const results = joyas.map((j) => ({
    name: j.nombre,
    href: `${basePath}/${j.id}`,
  }));
  return {
    total: joyas.length,
    results,
  };
};

module.exports = { prepararHATEOAS };
