import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, RefreshCw, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { toast } from './ui/sonner';

interface PhotoGroup {
  id: string;
  urls: string[]; // Array of image URLs (1-3 photos)
  caption: string;
  location: string;
  date: string;
  trip: string;
}

interface PhotoGalleryProps {
  photos: PhotoGroup[];
  title: string;
  onPhotoReplace: (photoId: string, newFile: File) => void;
}

export function PhotoGallery({ photos, title, onPhotoReplace }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoGroup | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = (photo: PhotoGroup) => {
    setSelectedPhoto(photo);
    setCurrentImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    if (selectedPhoto) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedPhoto.urls.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedPhoto) {
      setCurrentImageIndex((prev) => 
        prev === selectedPhoto.urls.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto || selectedPhoto.urls.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      }
    };

    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhoto, currentImageIndex]);

  const handleReplacePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/') && selectedPhoto) {
      onPhotoReplace(selectedPhoto.id, file);
      setSelectedPhoto(null);
      setCurrentImageIndex(0);
      toast.success('Фотография успешно заменена!');
    } else if (file && !file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
    }
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-card border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="aspect-square overflow-hidden relative">
              <ImageWithFallback
                src={photo.urls[0]}
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {photo.urls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                  <Layers className="w-3 h-3" />
                  <span>{photo.urls.length}</span>
                </div>
              )}
            </div>
            
            <div className="p-3 space-y-2">
              <p className="text-sm overflow-hidden" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>{photo.caption}</p>
              
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <MapPin className="w-3 h-3" />
                <span>{photo.location}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{photo.date}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {photo.trip}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={handleCloseModal}>
          <DialogContent 
            className="max-w-4xl max-h-[90vh]"
            onClose={handleCloseModal}
          >
            <div className="space-y-4">
              <div className="relative">
                <ImageWithFallback
                  src={selectedPhoto.urls[currentImageIndex]}
                  alt={selectedPhoto.caption}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
                
                {selectedPhoto.urls.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-90 hover:opacity-100"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-90 hover:opacity-100"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {selectedPhoto.urls.length}
                    </div>
                  </>
                )}
              </div>
              
              {selectedPhoto.urls.length > 1 && (
                <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                  {selectedPhoto.urls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        index === currentImageIndex 
                          ? 'border-primary scale-110' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <ImageWithFallback
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="space-y-4">
                <h3>{selectedPhoto.caption}</h3>
                
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedPhoto.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedPhoto.date}</span>
                  </div>
                  
                  <Badge variant="outline">
                    {selectedPhoto.trip}
                  </Badge>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleReplacePhoto}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Заменить фото
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}