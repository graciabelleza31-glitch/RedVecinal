import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Post from './models/Post.js';
import connectDB from './config/db.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🧹 Limpiando base de datos...');
    
    // Borramos todo para empezar de cero
    await User.deleteMany({});
    await Post.deleteMany({});

    console.log('👷 Creando usuarios de prueba...');
    
    // Encriptamos la contraseña "123456"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('123456', salt);

    // 1. CREAMOS LOS USUARIOS
    const users = await User.insertMany([
      {
        nombre: 'Miguel', apellido: 'Torres', email: 'miguel@test.com', password: passwordHash,
        telefono: '999111222', ciudad: 'Lima', distrito: 'Los Olivos', barrio: 'Barrio Los Olivos',
        foto: 'https://i.pravatar.cc/150?img=11',
        location: { type: 'Point', coordinates: [-77.0428, -12.0464] }
      },
      {
        nombre: 'Ana', apellido: 'Rojas', email: 'ana@test.com', password: passwordHash,
        telefono: '999333444', ciudad: 'Lima', distrito: 'Los Olivos', barrio: 'Barrio Los Olivos',
        foto: 'https://i.pravatar.cc/150?img=5',
        location: { type: 'Point', coordinates: [-77.0435, -12.0470] }
      },
      {
        nombre: 'Carlos', apellido: 'Díaz', email: 'carlos@test.com', password: passwordHash,
        telefono: '999555666', ciudad: 'Lima', distrito: 'Los Olivos', barrio: 'Barrio Los Olivos',
        foto: 'https://i.pravatar.cc/150?img=3',
        location: { type: 'Point', coordinates: [-77.0420, -12.0450] }
      }
    ]);

    console.log('🔧 Creando publicaciones...');

    // 2. CREAMOS LAS PUBLICACIONES (Con los valores exactos de tu Post.js)
    await Post.insertMany([
      {
        author: users[0]._id, 
        tipo: 'oferta',           // Válido
        categoria: 'herramientas',// Válido
        titulo: 'Gasfitería 24/7', 
        descripcion: 'Reparación de fugas, griferías y calentadores. Rápido y confiable.',
        distrito: 'Los Olivos',
        barrio: 'Barrio Los Olivos',
      },
      {
        author: users[1]._id,
        tipo: 'oferta',
        categoria: 'herramientas',
        titulo: 'Electricista Certificada', 
        descripcion: 'Instalaciones eléctricas seguras para tu hogar. Trabajo garantizado.',
        distrito: 'Los Olivos',
        barrio: 'Barrio Los Olivos',
      },
      {
        author: users[2]._id,
        tipo: 'oferta',
        categoria: 'cuidado',     // Válido
        titulo: 'Jardinería y Paisajismo', 
        descripcion: 'Cuidado de plantas, poda y diseño de jardines para tu hogar.',
        distrito: 'Los Olivos',
        barrio: 'Barrio Los Olivos',
      },
      {
        author: users[0]._id,
        tipo: 'pedido',           // Válido
        categoria: 'compras',     // Válido
        titulo: 'Busco préstamo de taladro', 
        descripcion: 'Necesito un taladro para colgar unos cuadros este fin de semana. ¿Alguien me presta uno?',
        distrito: 'Los Olivos',
        barrio: 'Barrio Los Olivos',
      }
    ]);

    console.log('✅ ¡Base de datos llenada con éxito!');
    console.log('👤 Usuario de prueba: miguel@test.com | Contraseña: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();