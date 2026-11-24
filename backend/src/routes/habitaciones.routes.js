const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/habitaciones.controller');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.patch('/:id/estado', ctrl.updateEstado);
router.delete('/:id', ctrl.delete);

module.exports = router;
