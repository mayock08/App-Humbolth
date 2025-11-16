const fs = require('fs/promises');
const path = require('path');
const Materia = require('../models/Materia');

const DATA_FILE = path.join(__dirname, 'materias.json');

async function readFile() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
}

async function writeFile(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function findAll() {
  const data = await readFile();
  return data.map((item) => Materia.fromPlain(item));
}

async function findById(id) {
  const data = await readFile();
  const materia = data.find((item) => item.id === id);
  return materia ? Materia.fromPlain(materia) : null;
}

async function create(payload) {
  const materia = new Materia(payload);
  const data = await readFile();
  data.push(materia.toJSON());
  await writeFile(data);
  return materia;
}

async function update(id, payload) {
  const data = await readFile();
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const materia = Materia.fromPlain(data[index]);
  materia.update(payload);
  data[index] = materia.toJSON();
  await writeFile(data);
  return materia;
}

async function remove(id) {
  const data = await readFile();
  const newData = data.filter((item) => item.id !== id);
  if (newData.length === data.length) {
    return false;
  }
  await writeFile(newData);
  return true;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
