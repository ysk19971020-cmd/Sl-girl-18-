import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import ProfileCard from '@/components/features/ProfileCard';
import FilterPanel, { FilterOptions } from '@/components/features/FilterPanel';
import { Category, User } from '@/types';
import { getUsers, initializeStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    gender: 'all',
    verified: 'all',
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'newest',
  });

  useEffect(() => {
    initializeStorage();
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getUsers();
    // Filter: only show verified, category-approved, active, non-admin users
    const publicUsers = allUsers.filter(u => 
      !u.isAdmin && 
      u.status === 'active' && 
      u.verified && 
      u.categoryApproved
    );
    setUsers(publicUsers);
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      gender: 'all',
      verified: 'all',
      minPrice: 0,
      maxPrice: 0,
      sortBy: 'newest',
    });
  };

  // Apply all filters and sorting
  const filteredUsers = users
    .filter(user => {
      // Category filter
      if (selectedCategory === 'all') {
        // Continue
      } else if (selectedCategory === 'verified') {
        if (!user.verified) return false;
      } else {
        if (user.category !== selectedCategory) return false;
      }

      // Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchUsername = user.username.toLowerCase().includes(query);
        const matchDescription = user.description?.toLowerCase().includes(query);
        const matchCategory = user.category.toLowerCase().includes(query);
        if (!matchUsername && !matchDescription && !matchCategory) return false;
      }

      // Gender filter
      if (filters.gender !== 'all') {
        if (user.gender !== filters.gender) return false;
      }

      // Verification filter
      if (filters.verified !== 'all') {
        if (filters.verified === 'verified' && !user.verified) return false;
        if (filters.verified === 'unverified' && user.verified) return false;
      }

      // Price range filter (based on chat price)
      const chatPrice = user.chatPrice || 0;
      if (filters.minPrice > 0 && chatPrice < filters.minPrice) return false;
      if (filters.maxPrice > 0 && chatPrice > filters.maxPrice) return false;

      return true;
    })
    .sort((a, b) => {
      // Sorting
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-low':
          return (a.chatPrice || 0) - (b.chatPrice || 0);
        case 'price-high':
          return (b.chatPrice || 0) - (a.chatPrice || 0);
        default:
          return 0;
      }
    });

  const activeFiltersCount = 
    (filters.searchQuery ? 1 : 0) +
    (filters.gender !== 'all' ? 1 : 0) +
    (filters.verified !== 'all' ? 1 : 0) +
    (filters.minPrice > 0 || filters.maxPrice > 0 ? 1 : 0) +
    (filters.sortBy !== 'newest' ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Promotional Hero Banner */}
      <div className="relative w-full">
        <img
          src="/promo-banner.jpg"
          alt="PrivateConnect - Verified Adult Profiles Only"
          className="w-full h-auto max-h-[600px] object-contain bg-black"
        />
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Mobile Category Selector & Filter Button */}
          <div className="lg:hidden w-full mb-4 space-y-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
            >
              <option value="all">All Profiles</option>
              <option value="girls">Girls Personal</option>
              <option value="boys">Boys Personal</option>
              <option value="livecam">Live Cam</option>
              <option value="spa">Spa</option>
              <option value="verified">Verified Profiles</option>
              <option value="others">Others</option>
            </select>

            <Button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <SlidersHorizontal size={18} />
              Filters & Search
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {selectedCategory === 'all' ? 'All Profiles' : 
                 selectedCategory === 'verified' ? 'Verified Profiles' :
                 selectedCategory === 'girls' ? 'Girls Personal' :
                 selectedCategory === 'boys' ? 'Boys Personal' :
                 selectedCategory === 'livecam' ? 'Live Cam' :
                 selectedCategory === 'spa' ? 'Spa' :
                 selectedCategory === 'others' ? 'Others' : selectedCategory}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-muted-foreground">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'profile' : 'profiles'} found
                </p>
                
                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {filters.searchQuery && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        Search: {filters.searchQuery}
                        <X 
                          size={12} 
                          className="cursor-pointer hover:text-primary/70"
                          onClick={() => setFilters({ ...filters, searchQuery: '' })}
                        />
                      </span>
                    )}
                    {filters.gender !== 'all' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        {filters.gender === 'female' ? 'Female' : 'Male'}
                        <X 
                          size={12} 
                          className="cursor-pointer hover:text-primary/70"
                          onClick={() => setFilters({ ...filters, gender: 'all' })}
                        />
                      </span>
                    )}
                    {filters.verified !== 'all' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        {filters.verified === 'verified' ? 'Verified Only' : 'Unverified'}
                        <X 
                          size={12} 
                          className="cursor-pointer hover:text-primary/70"
                          onClick={() => setFilters({ ...filters, verified: 'all' })}
                        />
                      </span>
                    )}
                    {(filters.minPrice > 0 || filters.maxPrice > 0) && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        Rs {filters.minPrice || 0} - {filters.maxPrice || '∞'}
                        <X 
                          size={12} 
                          className="cursor-pointer hover:text-primary/70"
                          onClick={() => setFilters({ ...filters, minPrice: 0, maxPrice: 0 })}
                        />
                      </span>
                    )}
                    {filters.sortBy !== 'newest' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                        Sort: {filters.sortBy === 'price-low' ? 'Price Low-High' : 'Price High-Low'}
                        <X 
                          size={12} 
                          className="cursor-pointer hover:text-primary/70"
                          onClick={() => setFilters({ ...filters, sortBy: 'newest' })}
                        />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg">
                <p className="text-muted-foreground mb-2">No profiles found matching your filters.</p>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    size="sm"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <ProfileCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </main>

          {/* Desktop Filter Panel */}
          <div className="hidden lg:block w-64">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel (Fullscreen Modal) */}
      {showMobileFilters && (
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onReset={resetFilters}
          showMobileFilters={true}
          onCloseMobileFilters={() => setShowMobileFilters(false)}
        />
      )}

      <Footer />
    </div>
  );
}
