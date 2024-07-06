const express = require('express');
const router = express.Router();
const {
    getCircuits,
    getCircuit,
    createCircuit,
    deleteCircuit,
    createEvent,
    deleteEvent
} = require('../controller/circuitsController');

const { isAuth } = require('../config/auth');

router.get('/circuits', isAuth, getCircuits)
router.get('/circuits/:tokenLayerAddress', isAuth, getCircuit)
router.post('/circuits/:tokenLayerAddress/events', isAuth, createEvent)
router.delete('/circuits/:tokenLayerAddress/events/:id', isAuth, deleteEvent)
router.post('/circuits', isAuth, createCircuit)
router.delete('/circuits/:tokenLayerAddress', isAuth, deleteCircuit)

module.exports = router;