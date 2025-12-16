import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';

const TRIPS = [
  { id: 'all', name: 'Все моменты', icon: '🌍' },
  { id: 'Дом', name: 'Дом', icon: '🏡' },
  { id: 'Свидания', name: 'Свидания', icon: '💋' },
  { id: 'В кадре', name: 'Любовь в кадре', icon: '🎞️' },
  { id: 'За кадром', name: 'За кадром', icon: '💤' },
  { id: 'Любовь в глазах', name: 'Любовь в глазах смотрящего', icon: '🔮' },
  { id: 'Мем', name: 'Мем прикол ржака', icon: '😄' }
];

interface TripFilterProps {
  selectedTrip: string;
  onTripChange: (trip: string) => void;
  photoCounts: Record<string, number>;
}

export function TripFilter({ selectedTrip, onTripChange, photoCounts }: TripFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3>Фильтр по моментам</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {TRIPS.map((trip) => {
          const count = trip.id === 'all' 
            ? Object.values(photoCounts).reduce((sum, count) => sum + count, 0)
            : photoCounts[trip.id] || 0;
            
          return (
            <Button
              key={trip.id}
              variant={selectedTrip === trip.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTripChange(trip.id)}
              className="gap-2"
            >
              <span>{trip.icon}</span>
              <span>{trip.name}</span>
              <Badge 
                variant={selectedTrip === trip.id ? 'secondary' : 'outline'}
                className="ml-1"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
}