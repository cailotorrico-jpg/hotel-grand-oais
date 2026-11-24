const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bitacora.controller');

router.get('/', ctrl.getAll);

module.exports = router;
