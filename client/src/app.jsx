import { useMemo, useState } from "react";

const safe = (v) => (v === undefined || v === null ? "" : String(v));

function buildQuery(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") sp.set(k, String(v).trim());
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function apiGet(path) {
  const res = await fetch(path);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error("HTTP_ERROR");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export default function App() {
  const [limits, setLimits] = useState(3);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState("stock_ASC");

  const [precioMin, setPrecioMin] = useState(25000);
  const [precioMax, setPrecioMax] = useState(30000);
  const [categoria, setCategoria] = useState("aros");
  const [metal, setMetal] = useState("plata");

  const [hateoas, setHateoas] = useState({ total: "-", results: [] });
  const [filtros, setFiltros] = useState([]);

  const [output, setOutput] = useState("Listo.");
  const [loading, setLoading] = useState(false);

  const hateoasRows = useMemo(() => hateoas?.results || [], [hateoas]);
  const filtrosRows = useMemo(() => (Array.isArray(filtros) ? filtros : []), [filtros]);

  const run = async (fn) => {
    try {
      setLoading(true);
      const data = await fn();
      setOutput(JSON.stringify(data, null, 2));
    } catch (e) {
      const payload = {
        status: e?.status,
        error: e?.data || e?.message || String(e),
      };
      setOutput(JSON.stringify(payload, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onHealth = () => run(() => apiGet("/api/health"));
  const onJoyas = () =>
    run(async () => {
      const qs = buildQuery({ limits, page, order_by: orderBy });
      const data = await apiGet(`/joyas${qs}`);
      setHateoas(data);
      return data;
    });

  const onFiltros = () =>
    run(async () => {
      const qs = buildQuery({ precio_min: precioMin, precio_max: precioMax, categoria, metal });
      const data = await apiGet(`/joyas/filtros${qs}`);
      setFiltros(data);
      return data;
    });

  return (
    <main className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h1 className="h3 mb-1">Tienda de Joyas - Front de Pruebas (Vite + React + Bootstrap)</h1>
          <p className="text-muted mb-0">
            UI para probar <code>/joyas</code> (HATEOAS, paginación, ordenamiento) y <code>/joyas/filtros</code>.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={onHealth} disabled={loading}>
            Healthcheck
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setOutput("Listo.")} disabled={loading}>
            Limpiar
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5">GET /joyas</h2>
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label">limits</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={limits}
                    onChange={(e) => setLimits(Number(e.target.value))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">page</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={page}
                    onChange={(e) => setPage(Number(e.target.value))}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label">order_by</label>
                  <input
                    type="text"
                    className="form-control"
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    placeholder="stock_ASC"
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-success w-100 mt-2" onClick={onJoyas} disabled={loading}>
                    {loading ? "Consultando..." : "Consultar joyas (HATEOAS)"}
                  </button>
                  <div className="form-text">Ejemplo: <code>?limits=3&page=2&order_by=stock_ASC</code></div>
                </div>
              </div>

              <hr className="my-3" />

              <h3 className="h6 mb-2">Resultado (HATEOAS)</h3>
              <div className="table-responsive">
                <table className="table table-sm table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Href</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hateoasRows.length ? (
                      hateoasRows.map((r, i) => (
                        <tr key={i}>
                          <td>{safe(r.name)}</td>
                          <td>
                            <code>{safe(r.href)}</code>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-muted" colSpan={2}>
                          Sin datos aún…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="small text-muted mt-2">Total: {safe(hateoas?.total ?? "-")}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5">GET /joyas/filtros</h2>

              <div className="alert alert-info py-2 small mb-3">
                <strong>Modo “blindado”:</strong> si envías <code>precio_min</code> y <code>precio_max</code> invertidos,
                la API los intercambia automáticamente para aplicar el rango correcto.
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">precio_min</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={precioMin}
                    onChange={(e) => setPrecioMin(Number(e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">precio_max</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={precioMax}
                    onChange={(e) => setPrecioMax(Number(e.target.value))}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">categoria</label>
                  <input type="text" className="form-control" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label">metal</label>
                  <input type="text" className="form-control" value={metal} onChange={(e) => setMetal(e.target.value)} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary w-100 mt-2" onClick={onFiltros} disabled={loading}>
                    {loading ? "Consultando..." : "Filtrar joyas"}
                  </button>
                  <div className="form-text">
                    Ejemplo: <code>?precio_min=25000&precio_max=30000&categoria=aros&metal=plata</code>
                  </div>
                </div>
              </div>

              <hr className="my-3" />

              <h3 className="h6 mb-2">Resultado (filtros)</h3>
              <div className="table-responsive">
                <table className="table table-sm table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Metal</th>
                      <th>Precio</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrosRows.length ? (
                      filtrosRows.map((r) => (
                        <tr key={r.id}>
                          <td>{safe(r.id)}</td>
                          <td>{safe(r.nombre)}</td>
                          <td>{safe(r.categoria)}</td>
                          <td>{safe(r.metal)}</td>
                          <td>{safe(r.precio)}</td>
                          <td>{safe(r.stock)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="text-muted" colSpan={6}>
                          Sin datos aún…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 mb-2">Respuesta JSON / Errores</h2>
              <pre className="p-3 bg-dark text-light rounded small mb-0" style={{ minHeight: 180, overflow: "auto" }}>
                {output}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-muted small mt-3">
        <div>
          Dev server: <code>http://localhost:5173</code> (Vite) → Proxy a API: <code>http://localhost:3000</code>
        </div>
      </footer>
    </main>
  );
}
