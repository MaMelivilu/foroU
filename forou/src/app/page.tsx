import Image from "next/image";
import Link from "next/link"; // 👈 Importamos Link para navegar entre páginas

export default function Home() {
  return (
    <div>
      <main>
        <header className="flex items-center justify-between p-4">
          {/* Logo + Título */}
          <div className="flex items-center gap-2">
            <img src="/Logo_ForoU.png" alt="Logo" className="w-12 h-12" />
            <h1 className="text-2xl font-bold">
              <span className="Foro">Foro</span>
              <span className="U text-blue-600">U</span>
            </h1>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex">
            <input
              type="text"
              placeholder="¿Qué estás buscando?..."
              className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none w-72"
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md border border-gray-300">
              Buscar
            </button>
          </div>

          {/* Botones Login y Register */}
          <div className="flex gap-2">
            <Link href="/login">
              <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Login
              </button>
            </Link>

            <Link href="/registrar">
              <button className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800">
                Register
              </button>
            </Link>
          </div>
        </header>
      </main>
    </div>
  );
}
