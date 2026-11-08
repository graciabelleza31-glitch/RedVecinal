import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Post from '../models/Post.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const COLLATION = { locale: 'es', strength: 2 };

export const updateProfile = asyncHandler(async (req, res) => {
  const { nombre, apellido, distrito, barrio, telefono = '', bio = '' } = req.body;

  if (!nombre?.trim() || !apellido?.trim() || !distrito?.trim() || !barrio?.trim()) {
    return res
      .status(400)
      .json({ message: 'Nombre, apellido, distrito y barrio son obligatorios.' });
  }
  if (telefono && !/^[0-9+\s-]{6,20}$/.test(telefono.trim())) {
    return res.status(400).json({ message: 'El teléfono no es válido.' });
  }

  const user = await User.findById(req.user._id);
  user.nombre = nombre;
  user.apellido = apellido;
  user.distrito = distrito;
  user.barrio = barrio;
  user.telefono = telefono;
  user.bio = bio;
  await user.save();

  res.json({ user: user.toPublic() });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Completa ambas contraseñas.' });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: 'Contraseña actualizada.' });
});

export const getNeighbors = asyncHandler(async (req, res) => {
  const filter = {
    distrito: req.user.distrito,
    barrio: req.user.barrio,
    _id: { $ne: req.user._id },
  };

  const [neighbors, postsCount] = await Promise.all([
    User.find(filter)
      .collation(COLLATION)
      .select('nombre apellido createdAt')
      .sort({ createdAt: -1 })
      .limit(50),
    Post.countDocuments({ distrito: req.user.distrito, barrio: req.user.barrio }).collation(
      COLLATION
    ),
  ]);

  res.json({
    count: neighbors.length + 1,
    postsCount,
    neighbors: neighbors.map((n) => ({
      id: n._id,
      nombre: n.nombre,
      apellido: n.apellido,
    })),
  });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID no válido.' });
  }

  // 1. Buscamos al usuario (sin el correo por privacidad)
  const user = await User.findById(req.params.id).select(
    'nombre apellido barrio distrito bio telefono createdAt foto recomendaciones'
  );
  
  if (!user) return res.status(404).json({ message: 'Vecino no encontrado.' });

  // 2. BUSCAMOS SUS PUBLICACIONES (Esto es lo que faltaba)
  const posts = await Post.find({ author: user._id })
    .sort({ createdAt: -1 })
    .populate('author', 'nombre apellido barrio');

  // 3. Devolvemos todo
  res.json({
    user: {
      id: user._id,
      nombre: user.nombre,
      apellido: user.apellido,
      barrio: user.barrio,
      distrito: user.distrito,
      bio: user.bio || '',
      telefono: user.telefono || '',
      foto: user.foto || '',
      recomendaciones: user.recomendaciones?.length || 0,
      createdAt: user.createdAt,
    },
    posts: posts, // <-- AQUÍ ENVIAMOS LOS POSTS AL FRONTEND
  });
});