const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/materiaController');

const router = express.Router();

const materiaValidators = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion').isString().withMessage('La descripción debe ser texto').optional({ nullable: true }),
  body('planEstudio').isObject().withMessage('El plan de estudio debe ser un objeto').optional(),
  body('puntosEvaluacion').isArray().withMessage('Los puntos de evaluación deben estar en un arreglo').optional()
];

router.get('/', controller.listMaterias);
router.get('/:id', controller.getMateria);
router.get('/:id/n8n', controller.materiaToN8n);
router.post('/', materiaValidators, controller.createMateria);
router.put('/:id', materiaValidators, controller.updateMateria);
router.delete('/:id', controller.deleteMateria);

module.exports = router;
