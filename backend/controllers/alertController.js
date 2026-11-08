import mongoose from 'mongoose';
import Alert, { ALERT_TIPOS } from '../models/Alert.js';
import asyncHandler from '../utils/asyncHandler.js';

const COLLATION = { locale: 'es', strength: 2 };
const ALERT_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

const serializeAlert = (alert, userId) => {
  const author = alert.author || {};
  return {
    id: alert._id,
    tipo: alert.tipo,
    mensaje: alert.mensaje,
    ubicacion: alert.ubicacion,
    barrio: alert.barrio,
    distrito: alert.distrito,
    createdAt: alert.createdAt,
    isOwner: String(author._id) === String(userId),
    author: {
      nombre: author.nombre || 'Vecino',
      apellido: author.apellido || '',
      telefono: author.telefono || '',
    },
  };
};

export const getAlerts = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - ALERT_TTL_MS);

  const alerts = await Alert.find({
    distrito: req.user.distrito,
    activa: true,
    createdAt: { $gte: since },
  })
    .collation(COLLATION)
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('author', 'nombre apellido telefono');

  res.json({ alerts: alerts.map((a) => serializeAlert(a, req.user._id)) });
});

export const createAlert = asyncHandler(async (req, res) => {
  const { tipo, mensaje, ubicacion = '' } = req.body;

  if (!ALERT_TIPOS.includes(tipo)) {
    return res.status(400).json({ message: 'Elige el tipo de emergencia.' });
  }
  if (!mensaje?.trim()) {
    return res.status(400).json({ message: 'Describe brevemente la emergencia.' });
  }

  const alert = await Alert.create({
    author: req.user._id,
    tipo,
    mensaje,
    ubicacion,
    distrito: req.user.distrito,
    barrio: req.user.barrio,
  });

  const full = await Alert.findById(alert._id).populate('author', 'nombre apellido telefono');
  res.status(201).json({ alert: serializeAlert(full, req.user._id) });
});

export const resolveAlert = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID no válido.' });
  }
  const alert = await Alert.findById(req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alerta no encontrada.' });
  if (String(alert.author) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Solo quien creó la alerta puede cerrarla.' });
  }

  alert.activa = false;
  await alert.save();
  res.json({ id: req.params.id });
});
