import Image from "next/image";

export default function Home() {
  return (
    
    <div>
      <main>
        <header>
          {/* Titulo + Logo */}
          <img src="/Logo_ForoU.png" className="w-19" />
          <h1>
            
            <span className="Foro">Foro</span>
            <span className="U">U</span>
          </h1>
          
          


          {/* Barra de busqueda */}
          <div className="ml-auto flex">
            <input 
              type="text" 
              placeholder="Que estas buscando?..." 
              className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none w-120" 
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md border border-gray-300">
              Buscar
            </button>
          </div>

          <div className="ml-auto flex">
            <button className="px-8 py bg-blue-500 text-white">
              Login
            </button>
            <button className="px-5 py bg-blue-700 text-white">
              Register
            </button>

          </div>
          

        </header>
        
      </main>
    </div>
    
  );
}
