import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface FilterOptions {
  searchQuery: string;
  gender: 'all' | 'male' | 'female';
  verified: 'all' | 'verified' | 'unverified';
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price-low' | 'price-high';
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
  showMobileFilters?: boolean;
  onCloseMobileFilters?: () => void;
}

export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  onReset,
  showMobileFilters = false,
  onCloseMobileFilters 
}: FilterPanelProps) {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const panelClasses = showMobileFilters 
    ? "fixed inset-0 bg-background z-50 p-4 overflow-y-auto lg:hidden"
    : "hidden lg:block bg-card rounded-lg shadow-lg p-4 sticky top-20 h-fit";

  return (
    <div className={panelClasses}>
      {/* Mobile Header */}
      {showMobileFilters && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <SlidersHorizontal size={20} />
            Filters & Search
          </h2>
          <Button
            onClick={onCloseMobileFilters}
            variant="ghost"
            size="icon"
          >
            <X size={20} />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Username, description..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Gender
          </label>
          <select
            value={filters.gender}
            onChange={(e) => updateFilter('gender', e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        {/* Verification Filter */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Verification Status
          </label>
          <select
            value={filters.verified}
            onChange={(e) => updateFilter('verified', e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Profiles</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Price Range (Rs)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', Number(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Filters based on chat price
          </p>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Reset Button */}
        <Button
          onClick={onReset}
          variant="outline"
          className="w-full"
        >
          Reset All Filters
        </Button>

        {/* Mobile Apply Button */}
        {showMobileFilters && (
          <Button
            onClick={onCloseMobileFilters}
            className="w-full"
          >
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
}
