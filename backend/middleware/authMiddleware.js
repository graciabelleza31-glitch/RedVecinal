import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado: falta el token.' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'No autorizado: usuario no existe.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado: token inválido o vencido.' });
  }
};
