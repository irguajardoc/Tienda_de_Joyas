
const express = require("express");
const cors = require("cors");
const path = require("path");

const joyasRoutes = require("./routes/joyasRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000"  
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());


const clientDistPath = path.join(__dirname, "..", "..", "client", "dist");
app.use("/app", express.static(clientDistPath));
app.get("/app/*", (_req, res) => res.sendFile(path.join(clientDistPath, "index.html")));

app.get("/", (_req, res) => res.json({ status: "ok", service: "tienda-joyas-api" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "tienda-joyas-api" }));


app.use("/joyas", joyasRoutes);
app.get("*", (_req, res) => {
  res.status(404).json({ error: "Esta ruta no existe" });
});

module.exports = app;
