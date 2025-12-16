import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from './ui/sonner';

const TRIPS = [
  'Дом',
  'Свидания',
  'В кадре',
  'За кадром',
  'Любовь в глазах',
  'Мем'
];

interface PhotoUploadProps {
  onUpload: (photoData: {
    caption: string;
    location: string;
    date: string;
    trip: string;
    files: File[]; // Changed from single file to array
  }) => void;
}

interface SelectedFileWithPreview {
  file: File;
  previewUrl: string;
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    location: '',
    date: '',
    trip: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileWithPreview[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Пожалуйста, выберите изображения');
      return;
    }

    const remainingSlots = 3 - selectedFiles.length;
    if (imageFiles.length > remainingSlots) {
      toast.error(`Можно добавить еще только ${remainingSlots} фото (максимум 3)`);
      return;
    }

    const newFiles = imageFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0 || !formData.caption || !formData.location || !formData.date || !formData.trip) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    // Upload each file with the same metadata
    onUpload({
      ...formData,
      files: selectedFiles.map(item => item.file)
    });

    // Reset form
    setFormData({ caption: '', location: '', date: '', trip: '' });
    selectedFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    setSelectedFiles([]);
    setIsOpen(false);
    
    const photoText = selectedFiles.length === 1 ? 'Фотография добавлена' : `${selectedFiles.length} фотографии добавлены`;
    toast.success(`${photoText} в альбом!`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  if (!isOpen) {
    return (
      <div className="flex justify-center mb-8">
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          Добавить фотографии
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-8 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Добавить новые фотографии
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Фотографии (до 3 шт.)</Label>
            {selectedFiles.length < 3 && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Выберите до {3 - selectedFiles.length} фото
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>Выбрать файлы</span>
                  </Button>
                </Label>
              </div>
            )}
            
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {selectedFiles.map((item, index) => (
                  <div key={index} className="relative">
                    <img
                      src={item.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Описание</Label>
            <Textarea
              id="caption"
              placeholder="Опишите этот момент..."
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Место</Label>
            <Input
              id="location"
              placeholder="Где была сделана эта фотография?"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Дата</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {/* Trip */}
          <div className="space-y-2">
            <Label>Момент</Label>
            <Select value={formData.trip} onValueChange={(value) => setFormData({ ...formData, trip: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите момент" />
              </SelectTrigger>
              <SelectContent>
                {TRIPS.map((trip) => (
                  <SelectItem key={trip} value={trip}>
                    {trip}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Добавить в альбом
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}