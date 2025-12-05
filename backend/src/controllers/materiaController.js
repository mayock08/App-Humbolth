const { validationResult } = require('express-validator');
const repo = require('../data/materiaRepository');

function buildResponse(res, status, data) {
  return res.status(status).json(data);
}

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return buildResponse(res, 422, { errors: errors.array() });
  }
  return null;
}

async function listMaterias(req, res, next) {
  try {
    const materias = await repo.findAll();
    return buildResponse(res, 200, materias.map((materia) => materia.toJSON()));
  } catch (error) {
    return next(error);
  }
}

async function getMateria(req, res, next) {
  try {
    const materia = await repo.findById(req.params.id);
    if (!materia) {
      return buildResponse(res, 404, { message: 'Materia no encontrada' });
    }
    return buildResponse(res, 200, materia.toJSON());
  } catch (error) {
    return next(error);
  }
}

async function createMateria(req, res, next) {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  try {
    const materia = await repo.create(req.body);
    return buildResponse(res, 201, materia.toJSON());
  } catch (error) {
    return next(error);
  }
}

async function updateMateria(req, res, next) {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  try {
    const materia = await repo.update(req.params.id, req.body);
    if (!materia) {
      return buildResponse(res, 404, { message: 'Materia no encontrada' });
    }
    return buildResponse(res, 200, materia.toJSON());
  } catch (error) {
    return next(error);
  }
}

async function deleteMateria(req, res, next) {
  try {
    const removed = await repo.remove(req.params.id);
    if (!removed) {
      return buildResponse(res, 404, { message: 'Materia no encontrada' });
    }
    return buildResponse(res, 204, {});
  } catch (error) {
    return next(error);
  }
}

async function materiaToN8n(req, res, next) {
  try {
    const materia = await repo.findById(req.params.id);
    if (!materia) {
      return buildResponse(res, 404, { message: 'Materia no encontrada' });
    }
    return buildResponse(res, 200, materia.toN8nPayload());
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMaterias,
  getMateria,
  createMateria,
  updateMateria,
  deleteMateria,
  materiaToN8n
};
