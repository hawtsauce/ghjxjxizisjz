import React from 'react';
import { Music, Trophy, Palette, Cpu, Utensils, PartyPopper, Heart, Briefcase } from 'lucide-react';

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const categories = [
  { id: 'music', label: 'Music', icon: Music },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'tech', label: 'Tech', icon: Cpu },
  { id: 'food', label: 'Food & Drink', icon: Utensils },
  { id: 'party', label: 'Party', icon: PartyPopper },
  { id: 'wellness', label: 'Wellness', icon: Heart },
  { id: 'business', label: 'Business', icon: Briefcase },
];

export const CategoryFilters = ({ selectedCategory, onCategorySelect }: CategoryFiltersProps) => {
  return (
    <section className="px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg md:text-xl font-medium mb-6">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onCategorySelect(null)}
            className={`flex items-center gap-2 px-4 py-2 border border-black transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <span className="text-sm font-medium">All</span>
          </button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id === selectedCategory ? null : category.id)}
                className={`flex items-center gap-2 px-4 py-2 border border-black transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
