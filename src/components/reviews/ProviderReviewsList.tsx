// src/components/reviews/ProviderReviewsList.tsx
import React, { useEffect, useState } from 'react';
import { getProviderReviews } from '../../services/grade.service';
import type { PageResponse } from '../../services/grade.service';
import type { ReviewResponse } from '../../types/review.types';

interface ProviderReviewsListProps {
  providerId: number;
  refreshTrigger: number; // Cuando este número cambie, recargaremos las reseñas
}

export const ProviderReviewsList: React.FC<ProviderReviewsListProps> = ({ providerId, refreshTrigger }) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pedimos la página 0 con 5 elementos por defecto
        const data: PageResponse<ReviewResponse> = await getProviderReviews(providerId, 0, 5);
        
        // IMPORTANTE: Fallback seguro por si el backend devuelve un formato inesperado o vacío
        setReviews(data?.content || []); 
      } catch (err) {
        setError('Error al cargar las reseñas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Solo hacemos la petición si existe un providerId válido
    if (providerId) {
      fetchReviews();
    }
  }, [providerId, refreshTrigger]); // El useEffect se dispara si cambia el ID o el trigger

  if (loading) return (
    <div className="flex justify-center items-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
    </div>
  );

  if (error) return <p className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded-lg">{error}</p>;
  
  if (reviews.length === 0) return (
    <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
      Aún no hay reseñas para mostrar.
    </p>
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      {reviews.map((review, index) => (
        // Usamos index como fallback si idReview no estuviera presente
        <div key={review.idReview || index} className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="font-bold text-slate-900 dark:text-white">
              {review.reviewerName || 'Cliente anónimo'}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-700">
              {new Date(review.date).toLocaleDateString()}
            </span>
          </div>
          
          {/* Renderizado de estrellas fijas con sombras suaves */}
          <div className="flex text-yellow-400 mb-3 text-lg drop-shadow-sm">
            {'★'.repeat(review.rating)}
            <span className="text-slate-300 dark:text-slate-600">
              {'★'.repeat(5 - review.rating)}
            </span>
          </div>
          
          {review.comment && (
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic">
              "{review.comment}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
};