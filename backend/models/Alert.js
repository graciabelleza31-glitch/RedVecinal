import mongoose from 'mongoose';

export const ALERT_TIPOS = ['medica', 'seguridad', 'incendio', 'otro'];

const alertSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, enum: ALERT_TIPOS, required: true },
    mensaje: { type: String, required: true, trim: true, maxlength: 300 },
    ubicacion: { type: String, trim: true, maxlength: 150, default: '' },
    distrito: { type: String, required: true, trim: true },
    barrio: { type: String, required: true, trim: true },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

alertSchema.index({ distrito: 1, activa: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
