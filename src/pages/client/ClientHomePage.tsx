import { Navbar } from '../../components/layout/Navbar';
import { Link } from 'react-router-dom';

export const ClientHomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* SECCIÓN 1: BIENVENIDA Y ACCIÓN RÁPIDA */}
        <section className="bg-brand-600 rounded-2xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
          {/* Círculos decorativos de fondo */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-500 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-brand-700 opacity-50 blur-2xl"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Qué problema necesitas resolver hoy?
            </h1>
            <p className="text-brand-100 text-lg mb-8">
              Conecta con plomeros, electricistas y desarrolladores calificados en minutos.
            </p>
            <Link 
              to="/create-petition"
              className="inline-flex items-center px-6 py-3 bg-white text-brand-600 font-bold rounded-lg shadow hover:bg-slate-50 transition-colors"
            >
              + Publicar Nueva Solicitud
            </Link>
          </div>
        </section>

        {/* SECCIÓN 2: TUS SOLICITUDES ACTIVAS (Resumen) */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-brand-500 rounded-full"></span>
            Tus Solicitudes Activas
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* CARD DE EJEMPLO (Luego lo conectaremos a la API) */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-brand-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                  Urgente
                </span>
                <span className="text-xs text-slate-500">Hace 2 horas</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Reparación de Cañería</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Godoy Cruz, Mendoza</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold">JD</div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-xs font-bold">+2</div>
                </div>
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Ver 3 postulantes →
                </button>
              </div>
            </div>

            {/* CARD "VACÍA" SI NO HAY NADA */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-500">
              <p className="mb-2">¿Necesitas algo más?</p>
              <Link to="/create-petition" className="text-sm font-medium text-brand-600 hover:underline">
                Crear otra solicitud
              </Link>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: PROFESIONALES DESTACADOS */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-amber-400 rounded-full"></span>
              Profesionales Recomendados
            </h2>
            <a href="#" className="text-sm text-brand-600 font-medium hover:underline">Ver todos</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* PROVEEDOR 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 text-center group hover:shadow-md transition-all">
              <div className="relative inline-block">
                <img 
                  src="https://ui-avatars.com/api/?name=Martin+L&background=random" 
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover group-hover:scale-105 transition-transform" 
                  alt="Avatar"
                />
                <span className="absolute bottom-1 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Martín López</h3>
              <p className="text-sm text-brand-600 font-medium mb-2">Electricista</p>
              <div className="flex justify-center text-amber-400 text-sm mb-4">★★★★★ <span className="text-slate-400 ml-1">(42)</span></div>
              <button className="w-full py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Ver Perfil
              </button>
            </div>

            {/* PROVEEDOR 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 text-center group hover:shadow-md transition-all">
              <div className="relative inline-block">
                <img 
                  src="https://ui-avatars.com/api/?name=Sofia+M&background=random" 
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover group-hover:scale-105 transition-transform" 
                  alt="Avatar"
                />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Sofía Mendez</h3>
              <p className="text-sm text-brand-600 font-medium mb-2">Desarrolladora Web</p>
              <div className="flex justify-center text-amber-400 text-sm mb-4">★★★★☆ <span className="text-slate-400 ml-1">(15)</span></div>
              <button className="w-full py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Ver Perfil
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};