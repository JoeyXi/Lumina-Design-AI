import React from 'react';
import { DesignStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: DesignStyle | null;
  onSelect: (style: DesignStyle) => void;
}

const styleImages: Record<DesignStyle, string> = {
  [DesignStyle.Modern]: "https://images.unsplash.com/photo-1502005229766-939760a7cb0d?w=300&h=200&fit=crop",
  [DesignStyle.Scandinavian]: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=300&h=200&fit=crop",
  [DesignStyle.Industrial]: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=300&h=200&fit=crop",
  [DesignStyle.Boho]: "https://images.unsplash.com/photo-1522771753035-4a5000b5b9fd?w=300&h=200&fit=crop",
  [DesignStyle.MidCentury]: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=300&h=200&fit=crop",
  [DesignStyle.Minimalist]: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=300&h=200&fit=crop",
  [DesignStyle.ArtDeco]: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=300&h=200&fit=crop",
  [DesignStyle.Coastal]: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=200&fit=crop",
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4">
      <div className="flex space-x-4 min-w-max px-1">
        {Object.values(DesignStyle).map((style) => (
          <button
            key={style}
            onClick={() => onSelect(style)}
            className={`relative rounded-xl overflow-hidden group transition-all duration-300 w-32 h-24 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${selectedStyle === style ? 'ring-4 ring-indigo-500 ring-offset-2 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'}
            `}
          >
            <img 
              src={styleImages[style]} 
              alt={style} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className={`absolute inset-0 flex items-end justify-center pb-2 bg-gradient-to-t from-black/80 to-transparent
                 ${selectedStyle === style ? 'from-indigo-900/80' : ''}
            `}>
              <span className="text-white text-xs font-medium px-2 text-center">{style}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
