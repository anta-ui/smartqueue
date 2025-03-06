// src/components/organizations/list/AdvancedFilters.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const REGIONS = [
  { value: 'all', label: 'Toutes les régions' },
  { value: 'north', label: 'Nord' },
  { value: 'south', label: 'Sud' },
  { value: 'east', label: 'Est' },
  { value: 'west', label: 'Ouest' },
  { value: 'central', label: 'Centre' }
];

const STATUSES = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'pending', label: 'En attente' }
];

const PLANS = [
  { value: 'all', label: 'Tous les plans' },
  { value: 'free', label: 'Gratuit' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' }
];

export function AdvancedFilters({ onFiltersChange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    plan: 'all',
    region: 'all',
    createdAfter: '',
    createdBefore: '',
    memberCount: ''
  });

  // Mettre à jour le nombre de filtres actifs
  useEffect(() => {
    const active = Object.entries(filters).filter(([key, value]) => {
      if (key === 'search' && value) return true;
      if (['status', 'plan', 'region'].includes(key) && value !== 'all') return true;
      if (['createdAfter', 'createdBefore', 'memberCount'].includes(key) && value) return true;
      return false;
    });
    
    setActiveFilters(active);
    
    // Notifier le parent des changements de filtres
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      plan: 'all',
      region: 'all',
      createdAfter: '',
      createdBefore: '',
      memberCount: ''
    });
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: key === 'search' ? '' : 'all' 
    }));
  };

  const formatFilterLabel = (key, value) => {
    switch (key) {
      case 'search':
        return `Recherche: ${value}`;
      case 'status':
        return `Statut: ${STATUSES.find(s => s.value === value)?.label}`;
      case 'plan':
        return `Plan: ${PLANS.find(p => p.value === value)?.label}`;
      case 'region':
        return `Région: ${REGIONS.find(r => r.value === value)?.label}`;
      case 'createdAfter':
        return `Créé après: ${value}`;
      case 'createdBefore':
        return `Créé avant: ${value}`;
      case 'memberCount':
        return `Nombre de membres: ${value}+`;
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <Card className="mb-6 shadow-sm border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md">Recherche & Filtres</CardTitle>
          <div className="flex items-center space-x-2">
            {activeFilters.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" /> Réinitialiser
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger 
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" /> Moins de filtres
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" /> Plus de filtres
                  </>
                )}
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
        <CardDescription>
          {activeFilters.length === 0 ? 
            "Recherchez et filtrez les organisations" : 
            `${activeFilters.length} filtre(s) actif(s)`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2 pb-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une organisation..."
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 my-3">
            {activeFilters.map(([key, value]) => (
              <Badge 
                key={key} 
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 bg-gray-100"
              >
                {formatFilterLabel(key, value)}
                <button 
                  onClick={() => removeFilter(key)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <Select
                  value={filters.plan}
                  onValueChange={(value) => handleSelectChange('plan', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map(plan => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => handleSelectChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(region => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Créée après</label>
                <Input
                  type="date"
                  name="createdAfter"
                  value={filters.createdAfter}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Créée avant</label>
                <Input
                  type="date"
                  name="createdBefore"
                  value={filters.createdBefore}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membres minimum</label>
                <Input
                  type="number"
                  name="memberCount"
                  placeholder="Ex: 5"
                  value={filters.memberCount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="mr-2"
              >
                Réinitialiser
              </Button>
              <Button 
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Appliquer les filtres
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}