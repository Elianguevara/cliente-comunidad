import { useState, useRef, type ChangeEvent } from 'react'; // <-- Agregamos "type" aquí
import { uploadImage } from '../../services/media.service';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export const ImageUploader = ({ onUploadSuccess }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (Máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy pesada. El máximo permitido es 5MB.');
      return;
    }

    // Mostrar previsualización local al instante
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Iniciar subida al backend / Cloudinary
    setIsUploading(true);
    try {
      const cloudinaryUrl = await uploadImage(file);
      onUploadSuccess(cloudinaryUrl); // Enviamos la URL final al componente padre
    } catch (error) {
      alert('Hubo un error al subir la imagen. Intenta nuevamente.');
      setPreview(null); // Limpiamos la vista si falla
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-slate-300 rounded-lg dark:border-slate-600 bg-white dark:bg-slate-800">
      
      {/* Input de archivo oculto */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Zona de previsualización */}
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Previsualización de la solicitud" 
            className="w-32 h-32 object-cover rounded-md shadow-md"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md backdrop-blur-sm">
              <span className="text-white text-xs font-bold animate-pulse">Subiendo...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md text-slate-400 dark:text-slate-500">
          <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="text-xs">Sin foto</span>
        </div>
      )}

      {/* Botón para disparar la selección */}
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded hover:bg-slate-300 disabled:opacity-50 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
      >
        {isUploading ? 'Procesando...' : preview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
      </button>
      
    </div>
  );
};