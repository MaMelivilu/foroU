import Link from "next/link";

export default function RegisterPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "#002e5c" }} // Fondo personalizado
    >
      {/* Ventana de registro en gris */}
      <div className="relative bg-gray-100 shadow-2xl rounded-2xl p-8 w-full max-w-md text-black flex flex-col items-center">
        
        {/* Botón de cerrar (X) */}
        <Link
          href="/"
          className="absolute top-3 left-3 text-gray-600 hover:text-black text-2xl font-bold"
        >
          ✕
        </Link>

        {/* Logo texto */}
        <div className="flex items-center gap-2 mb-6 mt-2">
          <h1 className="text-2xl font-bold">
            <span className="text-black">Foro</span>
            <span className="U text-blue-600">U</span>
          </h1>
        </div>

        <form className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-4">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
