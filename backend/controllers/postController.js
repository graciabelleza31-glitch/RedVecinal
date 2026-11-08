import mongoose from 'mongoose';
import Post, { TIPOS, CATEGORIAS } from '../models/Post.js';
import asyncHandler from '../utils/asyncHandler.js';

const COLLATION = { locale: 'es', strength: 2 };

const POPULATE = [
  { path: 'author', select: 'nombre apellido barrio' },
  { path: 'comments.author', select: 'nombre apellido' },
];

const same = (a, b) => String(a) === String(b);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const serializePost = (post, userId) => {
  const author = post.author || {};
  return {
    id: post._id,
    tipo: post.tipo,
    categoria: post.categoria,
    titulo: post.titulo,
    descripcion: post.descripcion,
    distrito: post.distrito,
    barrio: post.barrio,
    resuelto: post.resuelto,
    createdAt: post.createdAt,
    lat: post.lat ?? null,
    lng: post.lng ?? null,
    author: {
      id: author._id,
      nombre: author.nombre || 'Vecino',
      apellido: author.apellido || '',
      barrio: author.barrio || post.barrio,
    },
    likesCount: post.likes.length,
    liked: post.likes.some((id) => same(id, userId)),
    saved: post.savedBy.some((id) => same(id, userId)),
    isOwner: same(author._id, userId),
    comments: post.comments.map((c) => ({
      id: c._id,
      texto: c.texto,
      createdAt: c.createdAt,
      author: {
        id: c.author?._id,
        nombre: c.author?.nombre || 'Vecino',
        apellido: c.author?.apellido || '',
      },
    })),
  };
};

const loadPost = (id) => Post.findById(id).populate(POPULATE);
const invalidId = (res) => res.status(400).json({ message: 'ID no válido.' });

export const getPosts = asyncHandler(async (req, res) => {
  const { scope = 'distrito', tipo, categoria, q, author } = req.query;
  const filter = {};

  if (scope === 'barrio') {
    filter.distrito = req.user.distrito;
    filter.barrio = req.user.barrio;
  } else if (scope === 'distrito') {
    filter.distrito = req.user.distrito;
  }

  if (tipo && TIPOS.includes(tipo)) filter.tipo = tipo;
  if (categoria && CATEGORIAS.includes(categoria)) filter.categoria = categoria;
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ titulo: rx }, { descripcion: rx }];
  }
  // FILTRO POR AUTOR (Para el perfil público)
  if (author && mongoose.isValidObjectId(author)) filter.author = author;

  const posts = await Post.find(filter)
    .collation(COLLATION)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate(POPULATE);

  res.json({ posts: posts.map((p) => serializePost(p, req.user._id)) });
});

export const getSavedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ savedBy: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate(POPULATE);
  res.json({ posts: posts.map((p) => serializePost(p, req.user._id)) });
});

export const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate(POPULATE);
  res.json({ posts: posts.map((p) => serializePost(p, req.user._id)) });
});

export const createPost = asyncHandler(async (req, res) => {
  // Recibimos lat y lng del frontend
  const { tipo, categoria = 'general', titulo, descripcion, lat, lng } = req.body;

  if (!TIPOS.includes(tipo)) {
    return res.status(400).json({ message: 'Elige un tipo de publicación.' });
  }
  if (!CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ message: 'Categoría no válida.' });
  }
  if (!titulo?.trim() || !descripcion?.trim()) {
    return res.status(400).json({ message: 'Escribe un título y una descripción.' });
  }

  // Guardamos la ubicación si viene
  const coords = typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : {};

  const post = await Post.create({
    author: req.user._id,
    tipo,
    categoria,
    titulo,
    descripcion,
    distrito: req.user.distrito,
    barrio: req.user.barrio,
    ...coords // Inyecta lat y lng si existen
  });

  const full = await loadPost(post._id);
  res.status(201).json({ post: serializePost(full, req.user._id) });
});

export const toggleLike = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });

  const has = post.likes.some((id) => same(id, req.user._id));
  if (has) post.likes.pull(req.user._id);
  else post.likes.addToSet(req.user._id);
  await post.save();

  const full = await loadPost(post._id);
  res.json({ post: serializePost(full, req.user._id) });
});

export const toggleSave = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });

  const has = post.savedBy.some((id) => same(id, req.user._id));
  if (has) post.savedBy.pull(req.user._id);
  else post.savedBy.addToSet(req.user._id);
  await post.save();

  const full = await loadPost(post._id);
  res.json({ post: serializePost(full, req.user._id) });
});

export const addComment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  const { texto } = req.body;
  if (!texto?.trim()) {
    return res.status(400).json({ message: 'Escribe un comentario.' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });

  post.comments.push({ author: req.user._id, texto });
  await post.save();

  const full = await loadPost(post._id);
  res.status(201).json({ post: serializePost(full, req.user._id) });
});

export const toggleResolved = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });
  if (!same(post.author, req.user._id)) {
    return res.status(403).json({ message: 'Solo el autor puede hacer esto.' });
  }

  post.resuelto = !post.resuelto;
  await post.save();

  const full = await loadPost(post._id);
  res.json({ post: serializePost(full, req.user._id) });
});

export const deletePost = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return invalidId(res);
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Publicación no encontrada.' });
  if (!same(post.author, req.user._id)) {
    return res.status(403).json({ message: 'Solo el autor puede eliminarla.' });
  }

  await post.deleteOne();
  res.json({ id: req.params.id });
});