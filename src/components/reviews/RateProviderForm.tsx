// src/components/reviews/RateProviderForm.tsx
import React, { useState } from 'react';
import { rateProvider } from '../../services/grade.service';
import type { RateRequest } from '../../types/review.types';

interface RateProviderFormProps {
  providerId: number; // El ID del proveedor que se va a calificar
  // MODIFICADO: Ahora exporta el rating y el comment para que el padre los dibuje
  onSuccess?: (rating: number, comment: string) => void; 
}

export const RateProviderForm: React.FC<RateProviderFormProps> = ({ providerId, onSuccess }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Por favor, selecciona una calificación entre 1 y 5 estrellas.');
      return;
    }

    setLoading(true);
    setError(null);

    const request: RateRequest = {
      targetId: providerId,
      rating: rating,
      comment: comment.trim() !== '' ? comment : undefined,
    };

    try {
      await rateProvider(request);
      // MODIFICADO: Enviamos los datos escritos de vuelta a la vista principal
      if (onSuccess) onSuccess(rating, comment); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al enviar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md w-full max-w-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Califica al Proveedor</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Selector de Estrellas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Puntuación
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl ${
                  rating >= star ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-500 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Área de Comentario */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comentario (Opcional)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Cómo fue tu experiencia con este proveedor?"
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {/* Mensaje de Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Enviando...' : 'Enviar Calificación'}
        </button>
      </form>
    </div>
  );
};