// src/components/organizations/list/ExportData.jsx
'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  FileDown,
  FileText,
  Database,
  Calendar,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ExportData({ organizations = [] }) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFields, setSelectedFields] = useState({
    basic: true,
    members: true,
    activity: false,
    financial: false,
    technical: false
  });

  const handleFieldChange = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Simulation d'un délai pour l'exportation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer un objet de configuration pour l'exportation
      const exportConfig = {
        format: exportFormat,
        dateRange,
        startDate: dateRange === 'custom' ? startDate : null,
        endDate: dateRange === 'custom' ? endDate : null,
        fields: Object.entries(selectedFields)
          .filter(([_, selected]) => selected)
          .map(([field]) => field)
      };
      
      console.log('Exportation avec configuration:', exportConfig);
      
      // Dans une application réelle, vous feriez un appel API ici pour générer le fichier
      
      // Simuler un succès
      toast({
        title: "Exportation réussie",
        description: `Les données ont été exportées au format ${exportFormat.toUpperCase()}.`,
      });
      
      // Simuler un téléchargement
      if (exportFormat === 'csv') {
        downloadCSV(organizations);
      } else if (exportFormat === 'excel') {
        downloadExcel(organizations);
      } else {
        downloadJson(organizations);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      toast({
        title: "Échec de l'exportation",
        description: "Une erreur est survenue lors de l'exportation des données.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Fonctions de téléchargement simulées
  const downloadCSV = (data) => {
    // Ceci est une simplification. Dans une application réelle, vous utiliseriez une bibliothèque comme papaparse
    const fileName = `organisations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent("id,name,status,plan\n" +
      data.map(org => `${org.id},${org.name},${org.status},${org.plan}`).join("\n"));
    triggerDownload(dataStr, fileName);
  };

  const downloadExcel = (data) => {
    // Dans une application réelle, vous utiliseriez une bibliothèque comme exceljs ou xlsx
    const fileName = `organisations_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Simuler un lien de téléchargement XLSX (dans une application réelle, vous généreriez un fichier correct)
    toast({
      title: "Téléchargement Excel",
      description: "Cette fonctionnalité serait implémentée avec une bibliothèque comme exceljs ou xlsx.",
    });
  };

  const downloadJson = (data) => {
    const fileName = `organisations_${format(new Date(), 'yyyy-MM-dd')}.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    triggerDownload(dataStr, fileName);
  };

  const triggerDownload = (dataStr, fileName) => {
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          Exporter
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Exporter les données</SheetTitle>
          <SheetDescription>
            Configurez et téléchargez les données des organisations selon vos besoins.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Format d'exportation</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={exportFormat === 'csv' ? "default" : "outline"}
                className="flex flex-col items-center py-4 h-auto"
                onClick={() => setExportFormat('csv')}
              >
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-xs">CSV</span>
              </Button>
              <Button 
                variant={exportFormat === 'excel' ? "default" : "outline"}
                className="flex flex-col items-center py-4 h-auto"
                onClick={() => setExportFormat('excel')}
              >
                <FileText className="h-6 w-6 mb-1" />
                <span className="text-xs">Excel</span>
              </Button>
              <Button 
                variant={exportFormat === 'json' ? "default" : "outline"}
                className="flex flex-col items-center py-4 h-auto"
                onClick={() => setExportFormat('json')}
              >
                <Database className="h-6 w-6 mb-1" />
                <span className="text-xs">JSON</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Période</h3>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les données</SelectItem>
                <SelectItem value="month">Dernier mois</SelectItem>
                <SelectItem value="quarter">Dernier trimestre</SelectItem>
                <SelectItem value="year">Dernière année</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
            
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Date de début</label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Date de fin</label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Données à inclure</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="basic" 
                  checked={selectedFields.basic} 
                  onCheckedChange={() => handleFieldChange('basic')}
                />
                <label htmlFor="basic" className="text-sm">
                  Informations de base (nom, statut, plan)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="members" 
                  checked={selectedFields.members} 
                  onCheckedChange={() => handleFieldChange('members')}
                />
                <label htmlFor="members" className="text-sm">
                  Membres et utilisateurs
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="activity" 
                  checked={selectedFields.activity} 
                  onCheckedChange={() => handleFieldChange('activity')}
                />
                <label htmlFor="activity" className="text-sm">
                  Données d'activité et d'utilisation
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="financial" 
                  checked={selectedFields.financial} 
                  onCheckedChange={() => handleFieldChange('financial')}
                />
                <label htmlFor="financial" className="text-sm">
                  Informations financières
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="technical" 
                  checked={selectedFields.technical} 
                  onCheckedChange={() => handleFieldChange('technical')}
                />
                <label htmlFor="technical" className="text-sm">
                  Configuration technique
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </SheetClose>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportation...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Exporter
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}