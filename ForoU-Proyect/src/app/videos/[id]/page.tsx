"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import { db } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import LikeButton from "@/components/LikeButton";

export default function VideoDetailPage({ params }: any) {

  const { id } = React.use(params as Promise<{ id: string }>);

  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getVideo = async () => {
      try {
        const snap = await getDoc(doc(db, "videos", id));
        if (snap.exists()) {
          setVideo({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    getVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Cargando video...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <p>Video no encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-neutral-800 rounded-lg"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center py-6 px-4">
      <button
        onClick={() => router.back()}
        className="text-white mb-4 hover:text-gray-300"
      >
        ⬅ Volver
      </button>

      <div className="bg-black border border-gray-700 rounded-2xl p-4 shadow-lg w-full max-w-3xl">
        <video
          ref={videoRef}
          src={video.videoURL}
          className="w-full max-h-[80vh] object-cover rounded-xl"
          controls
          autoPlay
          loop
          playsInline
        />

        <div className="mt-4 text-white">
          <h1 className="text-2xl font-bold">{video.title}</h1>

          <p
            className="text-gray-300 mt-2 max-w-[700px] line-clamp-2 break-words"
          >
            {video.description}
          </p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <img
                src={video.usernamePhoto || "/default-avatar.png"}
                className="w-10 h-10 rounded-full border border-white/40 object-cover"
              />

              <span className="font-semibold">{video.username}</span>
            </div>

            <LikeButton videoId={video.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
