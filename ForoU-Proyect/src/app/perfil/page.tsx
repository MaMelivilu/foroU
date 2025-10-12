'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFirestoreUser } from "@/hooks/useFirestoreUser";
import { useUser } from "@/hooks/useUser";
import { updateDoc, doc } from "firebase/firestore";
import { db, storage } from "@/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
  const { user } = useUser();
  const { firestoreUser, loading } = useFirestoreUser();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user === null) router.push("/");

    if (firestoreUser) {
      setDisplayName(firestoreUser.displayName || "");
      setPhotoURL(firestoreUser.photoURL || "");
    }
  }, [user, firestoreUser, router]);

  // Click en la foto abre selector de archivos
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Subir archivo a Firebase Storage y actualizar preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Creamos referencia en storage
      const storageRef = ref(storage, `user_photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
    } catch (error) {
      console.error("Error al subir la foto:", error);
      alert("No se pudo subir la foto");
    }
  };

  // Guardar cambios en Firestore
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL
      });
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Ocurrió un error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading || !firestoreUser) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-700">Cargando perfil...</h1>
      </div>
    </div>
  );

  return (
    <div className="grid place-items-center h-screen">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl p-6 flex flex-col gap-4 relative">
        {/* Botón cerrar */}
        <button
          onClick={() => router.push("/posts")}
          className="absolute top-2 right-2 text-red-500 font-bold text-4xl hover:text-red-800 cursor-pointer"
        >
          ×
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mi Perfil</h1>

        <div className="flex flex-col items-center gap-4">
          {/* Foto editable */}
          <img
            src={photoURL || "/default-avatar.png"}
            alt="avatar"
            className="w-24 h-24 rounded-full border border-gray-300 cursor-pointer hover:opacity-80"
            onClick={handlePhotoClick}
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* Nombre */}
          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-500">Nombre de usuario</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nombre"
              className="p-2 rounded border border-gray-300 w-full text-center focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-500">Email conectado</label>
            <input
              type="email"
              value={firestoreUser.email}
              disabled
              className="p-2 rounded border border-gray-300 w-full text-center bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
