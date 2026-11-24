const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/consumos.controller');

router.get('/reserva/:idReserva', ctrl.getByReserva);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.delete('/:id', ctrl.delete);

module.exports = router;
