import {
  BookOpen,
  Bus,
  Car,
  Gift,
  GraduationCap,
  House,
  Laptop,
  Lightbulb,
  Plane,
  Shapes,
  Smartphone,
  Tag,
  Target,
  Utensils,
  Wallet
} from 'lucide-react';

export const ICON_COMPONENTS = {
  utensils: Utensils,
  plane: Plane,
  bus: Bus,
  'book-open': BookOpen,
  lightbulb: Lightbulb,
  house: House,
  shapes: Shapes,
  wallet: Wallet,
  tag: Tag,
  target: Target,
  laptop: Laptop,
  'graduation-cap': GraduationCap,
  car: Car,
  smartphone: Smartphone,
  gift: Gift
};

export const GOAL_ICONS = ['target', 'laptop', 'plane', 'graduation-cap', 'house', 'car', 'smartphone', 'gift'];

export default function CategoryIcon({ name, size = 18, color, fallback = 'tag' }) {
  const IconComponent = ICON_COMPONENTS[name] || ICON_COMPONENTS[fallback];
  return <IconComponent size={size} color={color} strokeWidth={2} aria-hidden="true" />;
}
