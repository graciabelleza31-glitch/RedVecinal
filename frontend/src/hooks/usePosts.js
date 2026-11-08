import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function usePosts(path) {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiRequest(path, { token })
      .then((data) => {
        if (!cancelled) setPosts(data.posts);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, token]);

  const updatePost = useCallback(
    (post) => setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p))),
    []
  );
  const removePost = useCallback(
    (id) => setPosts((prev) => prev.filter((p) => p.id !== id)),
    []
  );
  const addPost = useCallback((post) => setPosts((prev) => [post, ...prev]), []);

  return { posts, loading, error, updatePost, removePost, addPost };
}
