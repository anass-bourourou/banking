
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileScan, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentScannerProps {
  onScanComplete: (file: File, title: string, description: string) => void;
  isUploading: boolean;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScanComplete, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
      
      // Suggest a title based on the file name
      if (!title) {
        setTitle(file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' '));
      }
    }
  };

  const handleScan = () => {
    if (!selectedFile) {
      toast.error('Aucun fichier sélectionné', {
        description: 'Veuillez sélectionner un document à scanner'
      });
      return;
    }
    
    if (!title) {
      toast.error('Titre obligatoire', {
        description: 'Veuillez donner un titre à ce document'
      });
      return;
    }
    
    onScanComplete(selectedFile, title, description);
    
    // Reset form after successful upload
    if (!isUploading) {
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader className="bg-gradient-to-r from-bank-primary/10 to-bank-primary/5 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileScan className="h-5 w-5 text-bank-primary" />
          Scanner un Document
        </CardTitle>
        <CardDescription>
          Numérisez vos documents pour les stocker en toute sécurité
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-4">
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-2">
              <Label htmlFor="document-file">Sélectionner un document</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="document-file" 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="bank-input"
                />
              </div>
              <p className="text-xs text-bank-gray">
                Formats supportés: PDF, JPG, PNG, TIFF (Max 10MB)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-title">Titre du document *</Label>
              <Input 
                id="document-title"
                placeholder="Ex: Relevé bancaire mai 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bank-input"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-description">Description (optionnelle)</Label>
              <Textarea 
                id="document-description"
                placeholder="Ajoutez des détails sur ce document..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bank-input min-h-[100px] resize-none"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center border rounded-xl overflow-hidden bg-bank-gray-light/30">
            {preview ? (
              <img 
                src={preview} 
                alt="Aperçu du document" 
                className="max-w-full max-h-[300px] object-contain" 
              />
            ) : selectedFile ? (
              <div className="p-8 text-center">
                <FileScan className="h-16 w-16 text-bank-gray mx-auto mb-4" />
                <p className="text-bank-gray-dark font-medium">{selectedFile.name}</p>
                <p className="text-bank-gray text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileScan className="h-16 w-16 text-bank-gray mx-auto mb-4" />
                <p className="text-bank-gray">Aucun document sélectionné</p>
                <p className="text-bank-gray text-sm">
                  L'aperçu apparaîtra ici
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-3 border-t p-4 bg-bank-light/50">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedFile(null);
            setTitle('');
            setDescription('');
            setPreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          disabled={isUploading}
        >
          Réinitialiser
        </Button>
        <Button 
          className="bank-button"
          onClick={handleScan}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Scanner le document
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentScanner;
