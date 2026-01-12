import { useState, useEffect } from 'react';
import { mediaRepository } from '@tdc/firebase';
import type { MediaFile } from '@tdc/schemas';

interface UseLoginBackgroundReturn {
  backgroundImage: MediaFile | null;
  isLoading: boolean;
}

/**
 * Hook to get a random login background image
 */
export function useLoginBackground(): UseLoginBackgroundReturn {
  const [backgroundImage, setBackgroundImage] = useState<MediaFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBackground(): Promise<void> {
      try {
        const result = await mediaRepository.findLoginBackgrounds();
        if (result.success && result.data.length > 0) {
          // Pick a random image
          const randomIndex = Math.floor(Math.random() * result.data.length);
          setBackgroundImage(result.data[randomIndex]);
        }
      } catch (error) {
        console.error('Failed to fetch login background:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBackground();
  }, []);

  return { backgroundImage, isLoading };
}
