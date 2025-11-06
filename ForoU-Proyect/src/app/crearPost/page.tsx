'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { useFirestoreUser } from '@/hooks/useFirestoreUser';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface MediaFile {
  url: string;
  type: 'image' | 'video';
}

export default function CreatePost() {
  const router = useRouter();
  const { user } = useUser();
  const { firestoreUser, loading: userLoading } = useFirestoreUser();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user === null) router.push('/');
  }, [user, router]);

  if (!user || userLoading || !firestoreUser) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-700">Cargando usuario...</h1>
      </div>
    </div>
  );

  const handleAddMedia = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.startsWith('image') ? 'image' :
                     file.type.startsWith('video') ? 'video' : null;
    if (!fileType) {
      alert('Solo se permiten imágenes o videos');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `post_media/${user.uid}/${file.name}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setMediaFiles(prev => [...prev, { url, type: fileType }]);
    } catch (error) {
      console.error('Error subiendo el archivo:', error);
      alert('No se pudo subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        categories: categories.split(' ').filter(c => c.startsWith('#')),
        mediaFiles, // Guardamos URLs + tipo
        createdAt: serverTimestamp(),
        authorId: firestoreUser.id,
        authorName: firestoreUser.displayName,
        authorPhoto: firestoreUser.photoURL,
        votosTotales: 0,
      });

      setTitle('');
      setContent('');
      setCategories('');
      setMediaFiles([]);
      router.push('/posts');
    } catch (error) {
      console.error('Error al crear post:', error);
    }
  };

  return (
    <div className='grid place-items-center place-content-center h-screen'>
      <main className='place-items-center place-content-center bg-white rounded-[10px] shadow-[0_10px_25px_rgba(0,0,0,0.3)] p-6 h-[90vh] w-[90vh] overflow-y-auto relative'>
        <button
          onClick={() => router.push("/posts")}
          className="absolute top-2 right-2 text-red-500 font-bold text-4xl hover:text-red-800 cursor-pointer"
        >
          ×
        </button>
        <h1 className="text-3xl font-bold mb-6">Crear Nuevo Post</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="Título del post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 rounded focus:outline-none w-full bg-gray-50"
            required
          />

          <textarea
            placeholder="Contenido del post"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="p-2 rounded h-40 focus:outline-none w-full resize-none bg-gray-50"
            required
          />

          {/* Selector de archivos multimedia */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleAddMedia}
              className="bg-green-500 text-white py-2 rounded hover:bg-green-600 w-52"
            >
              {uploading ? "Subiendo..." : "Subir archivo multimedia"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,video/*"
              onChange={handleFileChange}
            />

            {/* Preview de archivos */}
            <div className="flex flex-wrap gap-2 mt-2">
              {mediaFiles.map((file, idx) => 
                file.type === 'image' ? (
                  <img key={idx} src={file.url} alt={`preview-${idx}`} className="w-24 h-24 object-cover rounded border" />
                ) : (
                  <video key={idx} src={file.url} className="w-32 h-24 rounded border" controls />
                )
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Categorías (ej: #nextjs #react)"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="p-2 rounded focus:outline-none w-full bg-gray-50"
          />

          <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 cursor-pointer">
            Crear Post
          </button>
        </form>
      </main>
    </div>
  );
}
