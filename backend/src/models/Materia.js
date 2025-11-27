const { v4: uuid } = require('uuid');

/**
 * Modelo de dominio para una Materia.
 * Incluye utilidades para exponer la información a n8n.
 */
class Materia {
  constructor({
    id = uuid(),
    nombre,
    descripcion,
    planEstudio = {},
    puntosEvaluacion = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    if (!nombre) {
      throw new Error('El nombre de la materia es obligatorio');
    }

    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion || '';
    this.planEstudio = planEstudio;
    this.puntosEvaluacion = puntosEvaluacion;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  update(payload = {}) {
    const now = new Date().toISOString();
    this.nombre = payload.nombre ?? this.nombre;
    this.descripcion = payload.descripcion ?? this.descripcion;
    this.planEstudio = payload.planEstudio ?? this.planEstudio;
    this.puntosEvaluacion = payload.puntosEvaluacion ?? this.puntosEvaluacion;
    this.updatedAt = now;
    return this;
  }

  /**
   * Representación que espera n8n cuando consume el recurso
   */
  toN8nPayload() {
    return {
      json: {
        id: this.id,
        nombre: this.nombre,
        descripcion: this.descripcion,
        planEstudio: this.planEstudio,
        puntosEvaluacion: this.puntosEvaluacion,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    };
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      planEstudio: this.planEstudio,
      puntosEvaluacion: this.puntosEvaluacion,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromPlain(data) {
    return new Materia(data);
  }
}

module.exports = Materia;
