import { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { petitionService } from '../../services/petition.service';
import type { PetitionResponse } from '../../types/petition.types';
// Librería para fechas relativas (ej: "hace 2 horas")
// Si no la tienes instalada: npm install date-fns
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const ClientHomePage = () => {
  // Estados para manejar la data y la carga
  const [myPetitions, setMyPetitions] = useState<PetitionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMyPetitions();
  }, []);

  const loadMyPetitions = async () => {
    try {
      setLoading(true);
      // Traemos las últimas 5 peticiones del cliente (página 0, tamaño 5)
      const data = await petitionService.getMyPetitions(0, 5);
      setMyPetitions(data.content);
    } catch (error) {
      console.error("Error cargando mis solicitudes", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* SECCIÓN 1: BIENVENIDA Y ACCIÓN RÁPIDA */}
        <section className="bg-brand-600 rounded-2xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
          {/* Decoración de fondo */}
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

        {/* SECCIÓN 2: TUS SOLICITUDES ACTIVAS (Dinámico) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-brand-500 rounded-full"></span>
              Tus Solicitudes Activas
            </h2>
          </div>
          
          {/* ESTADO DE CARGA (Skeletons) */}
          {loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
               ))}
            </div>
          )}

          {/* LISTA DE PETICIONES */}
          {!loading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              
              {/* Mapeo de datos reales */}
              {myPetitions.map((petition) => (
                <div key={petition.idPetition} className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-brand-300 transition-colors flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      {/* Badge de Tipo (Color dinámico) */}
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded 
                        ${petition.typePetitionName === 'Urgencia' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                        {petition.typePetitionName}
                      </span>
                      {/* Fecha Relativa */}
                      <span className="text-xs text-slate-500 capitalize">
                        {formatDistanceToNow(new Date(petition.dateSince), { addSuffix: true, locale: es })}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {petition.professionName}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                      {petition.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <span>📍 {petition.cityName}</span>
                      <span>•</span>
                      <span className={petition.stateName === 'PUBLICADA' ? 'text-green-600 font-medium' : 'text-slate-500'}>
                        {petition.stateName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Pie de tarjeta */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex -space-x-2">
                       {/* Placeholder de postulantes (futura funcionalidad) */}
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 border-2 border-white dark:border-slate-800" title="Aún no hay postulantes">?</div>
                    </div>
                    
                    {/* ENLACE AL DETALLE (Corregido) */}
                    <Link 
                      to={`/petition/${petition.idPetition}`}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              ))}

              {/* TARJETA "CREAR NUEVA" (Siempre visible al final) */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-500 min-h-[200px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                <Link to="/create-petition" className="flex flex-col items-center w-full h-full justify-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl text-slate-400 group-hover:text-brand-500 transition-colors">+</span>
                  </div>
                  <p className="mb-1 font-medium group-hover:text-brand-600 transition-colors">
                    {myPetitions.length === 0 ? "Aún no tienes solicitudes." : "¿Necesitas algo más?"}
                  </p>
                  <span className="text-sm font-bold text-brand-600 hover:underline">
                    Crear solicitud
                  </span>
                </Link>
              </div>

            </div>
          )}
        </section>

        {/* SECCIÓN 3: PROFESIONALES DESTACADOS (Estática por ahora) */}
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