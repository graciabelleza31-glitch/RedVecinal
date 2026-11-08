import usePosts from '../hooks/usePosts.js';
import PostList from '../components/PostList.jsx';

export default function Guardados() {
  const { posts, loading, error, updatePost, removePost } = usePosts('/posts/saved');

  // Si el usuario quita el guardado, la publicación sale de la lista
  const handleUpdate = (post) => {
    if (post.saved) updatePost(post);
    else removePost(post.id);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Guardados</h1>
        <p className="mt-1 text-gray-500">Las publicaciones que guardaste para ver después.</p>
      </div>

      <PostList
        posts={posts}
        loading={loading}
        error={error}
        onUpdate={handleUpdate}
        onDelete={removePost}
        emptyTitle="Todavía no guardaste nada"
        emptyText="Toca “Guardar” en cualquier publicación y aparecerá aquí."
      />
    </section>
  );
}
