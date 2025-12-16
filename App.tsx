import React, { useState, useMemo } from 'react';
import { PhotoGallery } from './components/PhotoGallery';
import { PhotoUpload } from './components/PhotoUpload';
import { TripFilter } from './components/TripFilter';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Calendar, MapPin, Heart, Camera } from 'lucide-react';
import { Toaster, ToastProvider } from './components/ui/sonner';

interface PhotoGroup {
  id: string;
  urls: string[]; // Array of image URLs (1-3 photos)
  caption: string;
  location: string;
  date: string;
  trip: string;
}

const INITIAL_PHOTOS: PhotoGroup[] = [
  {
    id: '1',
    urls: ['https://t.me/c/3015919477/48'],
    caption: 'Поездка в Казань на поезде с маминой подругой и ее сыном',
    location: 'Казанский Кремль',
    date: '2025-01-15',
    trip: 'Дом'
  },
  {
    id: '2',
    urls: ['https://images.unsplash.com/photo-1670766265687-2844f8011a88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NoaSUyMGJlYWNoJTIwc2lyaXVzfGVufDF8fHx8MTc1NjM5NzE3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    caption: 'Второй раз в Сочи, но теперь в Сириусе! Норм пляж с галькой',
    location: 'Пляж Сириус',
    date: '2025-06-20',
    trip: 'Свидания'
  },
  {
    id: '3',
    urls: ['https://images.unsplash.com/photo-1695109790780-0b12847a3489?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYmtoYXppYSUyMG1vdW50YWluc3xlbnwxfHx8fDE3NTYzOTcxNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    caption: 'Поехали дальше в Абхазию - красивые горы и природа',
    location: 'Абхазские горы',
    date: '2025-06-25',
    trip: 'В кадре'
  },
  {
    id: '4',
    urls: ['https://images.unsplash.com/photo-1663604378602-bcdd1158b617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjBhdGhvcyUyMG1vbmFzdGVyeXxlbnwxfHx8fDE3NTYzOTcxNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    caption: 'В Новом Афоне особо не помню, спал, но потом пошли в Новоафонские пещеры',
    location: 'Новоафонский монастырь',
    date: '2025-06-28',
    trip: 'За кадром'
  },
  {
    id: '5',
    urls: ['https://images.unsplash.com/photo-1539707599831-3bb48027b243?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVib2tzYXJ5JTIwcnVzc2lhfGVufDF8fHx8MTc1NjM5NzE3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    caption: 'В августе поехали в Чебоксары проверять зрение. Побывали в музее тракторов и на набережной',
    location: 'Набережная Чебоксары',
    date: '2025-08-10',
    trip: 'Любовь в глазах'
  },
  {
    id: '6',
    urls: ['https://images.unsplash.com/photo-1659526732567-0d51f7e9b53f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3Noa2FyLW9sYSUyMHJlZCUyMGJyaWNrfGVufDF8fHx8MTc1NjM5NzE3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
    caption: 'На один день в Йошкар-Олу - у них есть свои куранты и все дома из красного кирпича как копия Москвы. Реально круто!',
    location: 'Центр Йошкар-Олы',
    date: '2025-08-11',
    trip: 'Мем'
  }
];

let uploadCounter = 0;

export default function App() {
  const [photos, setPhotos] = useState<PhotoGroup[]>(INITIAL_PHOTOS);
  const [selectedTrip, setSelectedTrip] = useState('all');

  const handlePhotoUpload = (photoData: {
    caption: string;
    location: string;
    date: string;
    trip: string;
    files: File[];
  }) => {
    // In a real app, this would upload to cloud storage
    const newPhoto: PhotoGroup = {
      id: `${Date.now()}-${uploadCounter++}`,
      urls: photoData.files.map(file => URL.createObjectURL(file)),
      caption: photoData.caption,
      location: photoData.location,
      date: photoData.date,
      trip: photoData.trip
    };
    
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const handlePhotoReplace = (photoId: string, newFile: File) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        // Clean up old URLs if they were created with createObjectURL
        photo.urls.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        return {
          ...photo,
          urls: [URL.createObjectURL(newFile)]
        };
      }
      return photo;
    }));
  };

  const filteredPhotos = useMemo(() => {
    if (selectedTrip === 'all') {
      return photos;
    }
    return photos.filter(photo => photo.trip === selectedTrip);
  }, [photos, selectedTrip]);

  const photoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    photos.forEach(photo => {
      counts[photo.trip] = (counts[photo.trip] || 0) + 1;
    });
    return counts;
  }, [photos]);

  const totalPhotos = photos.length;
  const totalTrips = new Set(photos.map(p => p.trip)).size;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Camera className="w-8 h-8 text-primary" />
              <h1 className="text-4xl">ТАМ, ГДЕ УЮТ 2026</h1>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-muted-foreground text-lg">
              Наши незабываемые моменты и свидания
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl mb-1">{totalPhotos}</div>
                <p className="text-muted-foreground text-sm">Фотографий</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl mb-1">{totalTrips}</div>
                <p className="text-muted-foreground text-sm">Мест</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl mb-1">2026</div>
                <p className="text-muted-foreground text-sm">Ближе в моментах</p>
              </CardContent>
            </Card>
          </div>

          {/* Upload */}
          <PhotoUpload onUpload={handlePhotoUpload} />

          {/* Filter */}
          <TripFilter
            selectedTrip={selectedTrip}
            onTripChange={setSelectedTrip}
            photoCounts={photoCounts}
          />

          {/* Gallery */}
          {filteredPhotos.length > 0 ? (
            <PhotoGallery
              photos={filteredPhotos}
              title={
                selectedTrip === 'all' 
                  ? `Все фотографии (${filteredPhotos.length})`
                  : `${selectedTrip} (${filteredPhotos.length})`
              }
              onPhotoReplace={handlePhotoReplace}
            />
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="mb-2">Пока нет фотографий</h3>
                <p className="text-muted-foreground">
                  {selectedTrip === 'all' 
                    ? 'Добавьте первую фотографию в альбом'
                    : `Нет фотографий из поездки \"${selectedTrip}\"`
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="mt-16 text-center text-muted-foreground">
            <p>Сделано с ❤️ для сохранения наших воспоминаний</p>
          </div>
        </div>
        
        <Toaster position="bottom-right" />
      </div>
    </ToastProvider>
  );
}