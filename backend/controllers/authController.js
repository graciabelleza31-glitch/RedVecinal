import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const emailRegex = /^\S+@\S+\.\S+$/;

export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, distrito, barrio, password } = req.body;

    if (!nombre || !apellido || !email || !distrito || !barrio || !password) {
      return res.status(400).json({ message: 'Completa todos los campos.' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'El correo no es válido.' });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res
        .status(409)
        .json({ message: 'Ya existe una cuenta con ese correo.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      nombre,
      apellido,
      email,
      distrito,
      barrio,
      password: hashed,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: user.toPublic(),
    });
  } catch (error) {
    console.error('Error en register:', error.message);
    return res.status(500).json({ message: 'Error del servidor al registrar.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Ingresa tu correo y contraseña.' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    return res.json({
      token: generateToken(user._id),
      user: user.toPublic(),
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    return res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
  }
};

export const getMe = async (req, res) => {
  return res.json({ user: req.user.toPublic() });
};
