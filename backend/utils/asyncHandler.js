const asyncHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const first = Object.values(error.errors)[0];
      return res.status(400).json({ message: first?.message || 'Datos no válidos.' });
    }
    console.error(`Error en ${req.method} ${req.originalUrl}:`, error.message);
    return res.status(500).json({ message: 'Error del servidor.' });
  }
};

export default asyncHandler;
