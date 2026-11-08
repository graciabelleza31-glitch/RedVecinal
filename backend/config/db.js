import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️  MONGO_URI no definido. El servidor corre sin base de datos.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  No se pudo conectar a MongoDB: ${error.message}`);
    console.warn('   El servidor sigue activo; las rutas de auth fallarán hasta que haya conexión.');
    return false;
  }
};

export default connectDB;
