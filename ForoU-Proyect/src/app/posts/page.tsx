'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { logout, db } from "@/firebase/client"
import { useFirestoreUser } from "@/hooks/useFirestoreUser"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { useSavedPosts } from "@/hooks/useSavedPosts"
import { Bookmark, BookmarkCheck, House, LogOut, PencilLine } from "lucide-react"
import VoteButton from "@/components/VoteButton/page"

export default function HomePage() {
  const { user } = useUser()
  const router = useRouter()
  const { firestoreUser, loading: userLoading } = useFirestoreUser()
  const { savedPosts, toggleSave, loading: savedLoading } = useSavedPosts()

  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (user === null) router.push("/")
  }, [user, router])

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPosts(postsData)
      setFilteredPosts(postsData)
      setLoadingPosts(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const queryStr = search.trim().toLowerCase()
    if (!queryStr) {
      setFilteredPosts(posts)
      return
    }

    const categoriesQuery = queryStr
      .split(" ")
      .filter((q) => q.startsWith("#") && q.length > 1)

    const textQuery = queryStr
      .split(" ")
      .filter((q) => !q.startsWith("#"))
      .join(" ")

    const filtered = posts.filter((post) => {
      const titleMatch = textQuery
        ? post.title.toLowerCase().includes(textQuery)
        : true

      const categoriesMatch = categoriesQuery.length
        ? categoriesQuery.every((cat) =>
            (post.categories || []).some((c: string) =>
              c.toLowerCase().startsWith(cat)
            )
          )
        : true

      return titleMatch && categoriesMatch
    })

    setFilteredPosts(filtered)
  }, [search, posts])

  if (user === undefined || userLoading || loadingPosts || savedLoading) {
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
          href="/posts"
          className="mt-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 text-center flex items-center justify-left gap-2"
        >
          <House className="mr-2"/>
          Home
        </Link>

        <Link
          href="/crearPost"
          className="mt-4 px-3 py-2 text-gray-600 text-[18px] rounded hover:bg-gray-100 text-center flex items-center justify-left gap-2"
        >
          <PencilLine className="mr-2"/>
          Crear Post
        </Link>

        <button
          onClick={() => logout(router)}
          className="mt-auto px-3 py-2 text-red-400 rounded hover:bg-gray-100 hover:text-red-500 text-[18px] text-center cursor-pointer flex items-center justify-left"
        >
          <LogOut className="mr-2" />
          Cerrar sesión 
        </button>
      </aside>

      <main className="min-h-screen p-6 flex justify-center ml-[23%]">
        <div className="w-400 max-w-240 flex flex-col gap-6">
          <input
            type="text"
            placeholder="Buscar posts o categorías (#ejemplo)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-400 w-full"
          />

          {filteredPosts.length === 0 ? (
            <p className="text-gray-500 text-center mt-10 text-xl">
              No hay posts que coincidan con la búsqueda.
            </p>
          ) : (
            filteredPosts.map((post) => {
              const isSaved = savedPosts.some(p => p.id === post.id)

              return (
                <div
                  key={post.id}
                  className="relative bg-white rounded-lg shadow-2xl p-4 flex flex-col gap-4 hover:shadow-lg transition-shadow w-full"
                >
                  <Link href={`/contenidoPost/${post.id}`} className="block">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{getPreview(post.content, 20)}</p>

                    {post.mediaFiles && post.mediaFiles.length > 0 && (
                      <div
                        className={`grid ${post.mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-4 mt-4 w-full`}
                      >
                        {post.mediaFiles.map((media: any, idx: number) => (
                          <div
                            key={idx}
                            className="h-120 rounded overflow-hidden flex items-center justify-center"
                          >
                            {media.type === "video" ? (
                              <video src={media.url} className="max-w-full max-h-full" controls />
                            ) : (
                              <img src={media.url} alt={`media-${idx}`} className="w-full h-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {post.categories && post.categories.length > 0 && (
                      <div className="mt-2 text-sm text-gray-400">
                        {post.categories.join(", ")}
                      </div>
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
                  </Link>

                  {/* Botón de votación y guardado */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-4">
                    <VoteButton postId={post.id} />
                    {isSaved ? (
                      <BookmarkCheck
                        className="w-6 h-6 text-yellow-700 cursor-pointer hover:text-yellow-500 transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          toggleSave(post.id)
                        }}
                      />
                    ) : (
                      <Bookmark
                        className="w-6 h-6 text-yellow-500 cursor-pointer hover:text-yellow-700 transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          toggleSave(post.id)
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
