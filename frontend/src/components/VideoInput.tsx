// components/VideoInput.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface VideoInputProps {
  onSubmit: (url: string, force: boolean) => void;
  isLoading: boolean;
}

export default function VideoInput({ onSubmit, isLoading }: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [force, setForce] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), force);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="rounded-lg border border-gray-500 shadow-md p-6">
        <Label htmlFor="video-url" className="block text-sm font-medium mb-2">
          URL de video de YouTube
        </Label>
        <div className="flex gap-3">
          <Input
            id="video-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
          <Button
            type="submit"
            variant="outline"
            disabled={isLoading || !url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-950 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Procesando...' : 'Procesar'}
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Input
            id="force-reprocess"
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <Label htmlFor="force-reprocess" className="text-sm">
            Forzar reprocesamiento (aunque ya exista en la base de datos)
          </Label>
        </div>
        <p className="mt-2 text-sm">
          Ingresa un video de YouTube en español (máx. 1 hora)
        </p>
      </div>
    </form>
  );
}