const express = require('express');
const cors = require('cors');
const materiaRoutes = require('./routes/materiaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/materias', materiaRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Error interno', details: err.message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
