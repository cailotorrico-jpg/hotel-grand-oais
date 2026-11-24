const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/checkins.controller');

router.get('/reservas-confirmadas', ctrl.getReservasConfirmadas);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);

module.exports = router;
