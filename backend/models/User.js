import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 50 },
    apellido: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Correo no válido'],
    },
    distrito: { type: String, required: true, trim: true, maxlength: 80 },
    barrio: { type: String, required: true, trim: true, maxlength: 80 },
    telefono: { type: String, trim: true, maxlength: 20, default: '' },
    bio: { type: String, trim: true, maxlength: 200, default: '' },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    apellido: this.apellido,
    email: this.email,
    distrito: this.distrito,
    barrio: this.barrio,
    telefono: this.telefono || '',
    bio: this.bio || '',
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
