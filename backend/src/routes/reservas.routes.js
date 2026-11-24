const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservas.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.post('/con-detalles', ctrl.createWithDetails);
router.put('/:id', ctrl.update);
router.patch('/:id/estado', ctrl.updateEstado);
router.patch('/:id/cancelar', ctrl.cancel);
router.delete('/:id', ctrl.cancel);

module.exports = router;
