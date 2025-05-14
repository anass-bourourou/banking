
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ScanLine, Upload, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { ScanService } from '@/services/ScanService';

const DocumentScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        toast.error('Format non supporté', {
          description: 'Veuillez sélectionner une image au format JPEG ou PNG'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Fichier trop volumineux', {
          description: 'La taille maximum autorisée est de 5 Mo'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const captureFromCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // In a real app, we would set up a video element and allow the user to take a picture
      // For this example, we'll just show a toast
      toast.info('Capture de la caméra', {
        description: 'Fonctionnalité en cours de développement'
      });
      
      // Be sure to stop the stream
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      toast.error('Erreur de caméra', {
        description: 'Impossible d\'accéder à la caméra'
      });
      console.error('Camera error:', error);
    }
  };
  
  const uploadImage = async () => {
    if (!image) return;
    
    try {
      setIsUploading(true);
      
      // Convert the base64 string back to a file
      const base64Response = await fetch(image);
      const blob = await base64Response.blob();
      const file = new File([blob], 'scanned-check.jpg', { type: 'image/jpeg' });
      
      // Upload the file
      await ScanService.uploadCheckImage(file);
      
      toast.success('Chèque envoyé', {
        description: 'Votre chèque a été envoyé pour traitement'
      });
      
      clearImage();
    } catch (error) {
      toast.error('Échec de l\'envoi', {
        description: error instanceof Error ? error.message : 'Une erreur est survenue pendant l\'envoi'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ScanLine className="h-5 w-5 text-bank-primary" />
          <span>Scanner un chèque</span>
        </CardTitle>
        <CardDescription>
          Prenez une photo claire de votre chèque pour le déposer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!image ? (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted p-10">
              <input
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleFileSelection}
                className="hidden"
                ref={fileInputRef}
              />
              <ScanLine className="h-12 w-12 text-bank-gray" />
              <div className="text-center">
                <h3 className="font-medium">Scanner un chèque ou document</h3>
                <p className="text-sm text-bank-gray">
                  Sélectionnez ou prenez une photo de votre chèque
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importer une image</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={captureFromCamera}
                  className="flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Utiliser la caméra</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={image}
                  alt="Aperçu du chèque"
                  className="mx-auto max-h-96 rounded-lg border object-contain"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={clearImage}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={uploadImage}
                  disabled={isUploading}
                >
                  {isUploading ? 'Envoi en cours...' : 'Envoyer le chèque'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentScanner;
