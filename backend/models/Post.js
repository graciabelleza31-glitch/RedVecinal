import mongoose from 'mongoose';

export const TIPOS = ['pedido', 'oferta', 'aviso', 'evento'];
export const CATEGORIAS = [
  'general', 'compras', 'salud', 'mascotas', 'herramientas', 'transporte', 'seguridad', 'cuidado',
];

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    texto: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, enum: TIPOS, required: true },
    categoria: { type: String, enum: CATEGORIAS, default: 'general' },
    titulo: { type: String, required: true, trim: true, maxlength: 100 },
    descripcion: { type: String, required: true, trim: true, maxlength: 1000 },
    distrito: { type: String, required: true, trim: true },
    barrio: { type: String, required: true, trim: true },
    // NUEVOS CAMPOS PARA EL MAPA
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    resuelto: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ distrito: 1, barrio: 1, createdAt: -1 });
postSchema.index({ savedBy: 1 });
postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);