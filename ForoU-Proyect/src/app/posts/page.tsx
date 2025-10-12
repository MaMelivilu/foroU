'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { logout, db } from "@/firebase/client"
import { useFirestoreUser } from "@/hooks/useFirestoreUser"
import { collection, getDocs, query, orderBy } from "firebase/firestore"

export default function HomePage() {
  const { user } = useUser()
  const router = useRouter()
  const { firestoreUser, loading: userLoading } = useFirestoreUser()

  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (user === null) router.push("/")
  }, [user, router])

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPosts(postsData)
        setFilteredPosts(postsData)
      } catch (error) {
        console.error("Error al cargar los posts:", error)
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    const queryStr = search.trim().toLowerCase()
    if (!queryStr) {
      setFilteredPosts(posts)
      return
    }

    const categoriesQuery = queryStr
      .split(" ")
      .filter(q => q.startsWith("#") && q.length > 1)

    const textQuery = queryStr
      .split(" ")
      .filter(q => !q.startsWith("#"))
      .join(" ")

    const filtered = posts.filter(post => {
      const titleMatch = textQuery
        ? post.title.toLowerCase().includes(textQuery)
        : true

      const categoriesMatch = categoriesQuery.length
        ? categoriesQuery.every(cat =>
            (post.categories || []).some((c: string) =>
              c.toLowerCase().startsWith(cat)
            )
          )
        : true

      return titleMatch && categoriesMatch
    })

    setFilteredPosts(filtered)
  }, [search, posts])

  if (user === undefined || userLoading || loadingPosts) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Cargando...</h1>
        </div>
      </div>
    )
  }

  function getPreview(text: string, wordLimit: number) {
    const words = text.split(" ")
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(" ") + "..."
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white shadow-2xl flex flex-col p-4 fixed h-full">
        {firestoreUser && (
          <Link href="/perfil">
            <div className="flex items-center gap-3 mb-6 cursor-pointer">
              <img
                src={firestoreUser.photoURL || "/default-avatar.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full"
              />
              <span className="font-semibold">{firestoreUser.displayName}</span>
            </div>
          </Link>
        )}

        <Link
          href="/crearPost"
          className="mt-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
        >
          Crear Post
        </Link>

        <button
          onClick={() => logout(router)}
          className="mt-auto px-3 py-2 bg-red-500 text-white rounded hover:bg-red-800 text-center cursor-pointer "
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="min-h-screen p-6 flex justify-center ml-[30%]">
        <div className="w-full max-w-5xl flex flex-col gap-6"> {/* max-w aumentado */}
          <input
            type="text"
            placeholder="Buscar posts o categorías (#ejemplo)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-400 w-200"
          />

          {filteredPosts.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No hay posts que coincidan con la búsqueda.
            </p>
          ) : (
            filteredPosts.map((post) => (
              <Link key={post.id} href={`/contenidoPost/${post.id}`}>
                <div className="bg-white rounded-lg shadow-2xl p-4 flex flex-col gap-4 hover:shadow-lg transition-shadow cursor-pointer w-full">
                  <h2 className="text-lg font-semibold text-gray-800">{post.title}</h2>
                  <p className="text-gray-600 mt-1">{getPreview(post.content, 20)}</p>

                  {/* Render multimedia */}
                  {post.mediaFiles && post.mediaFiles.length > 0 && (
                  <div className={`grid ${post.mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-4 mt-4 w-200`}>
                    {post.mediaFiles.map((media: any, idx: number) => (
                      <div
                        key={idx}
                        className="h-120 rounded border-none overflow-hidden flex items-center justify-center"
                      >
                        {media.type === "video" ? (
                          <video
                            src={media.url}
                            className="max-w-full max-h-full"
                            controls
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={`media-${idx}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                  {post.categories && post.categories.length > 0 && (
                    <div className="mt-2 text-sm text-gray-400">{post.categories.join(", ")}</div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={post.authorPhoto || "/default-avatar.png"}
                      alt="avatar"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-400">
                      Publicado por {post.authorName}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
