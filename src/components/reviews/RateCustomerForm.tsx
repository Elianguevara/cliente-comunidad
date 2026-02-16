import { useState } from 'react';
import { rateCustomer } from '../../services/grade.service';

interface RateCustomerFormProps {
  customerId: number;
  petitionId: number;
  onSuccess: (rating: number, comment: string) => void;
}

export const RateCustomerForm = ({ customerId, petitionId, onSuccess }: RateCustomerFormProps) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor, selecciona una puntuación de 1 a 5 estrellas.');
      return;
    }
    try {
      setIsSubmitting(true);
      await rateCustomer(petitionId, customerId, rating, comment);
      onSuccess(rating, comment);
    } catch (error) {
      alert('Error al enviar la calificación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Puntuación del Cliente</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-3xl transition-colors drop-shadow-sm ${star <= (hover || rating) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600 hover:text-yellow-200'}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comentario sobre la experiencia (Opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-all resize-none"
          rows={3}
          placeholder="¿Cómo fue tu experiencia trabajando para este cliente? ¿Fue claro con lo que necesitaba?"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-50 active:scale-95 shadow-sm"
      >
        {isSubmitting ? 'Guardando reseña...' : 'Enviar Calificación'}
      </button>
    </form>
  );
};