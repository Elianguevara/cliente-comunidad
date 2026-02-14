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
        setReviews(data.content); // 'content' es el arreglo que devuelve Spring Boot
      } catch (err) {
        setError('Error al cargar las reseñas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [providerId, refreshTrigger]); // El useEffect se dispara si cambia el ID o el trigger

  if (loading) return <p className="text-gray-500 animate-pulse mt-4">Cargando reseñas...</p>;
  if (error) return <p className="text-red-500 mt-4">{error}</p>;
  if (reviews.length === 0) return <p className="text-gray-500 mt-4">Este proveedor aún no tiene reseñas. ¡Sé el primero en calificar!</p>;

  return (
    <div className="mt-8 flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-gray-800">Reseñas Recientes</h3>
      
      {reviews.map((review) => (
        <div key={review.idReview} className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-800">{review.reviewerName}</span>
            <span className="text-sm text-gray-500">
              {new Date(review.date).toLocaleDateString()}
            </span>
          </div>
          
          {/* Renderizado de estrellas fijas */}
          <div className="flex text-yellow-400 mb-2">
            {'★'.repeat(review.rating)}
            <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
          </div>
          
          {review.comment && (
            <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};