import { Artist } from './types';

export const ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'Chloe Artisan',
    location: 'Colombo 3',
    image: '',
    experience: 9,
    rating: 4.9,
    specialty: 'Hair Artistry & Color',
    services: [
      { id: 'svc1', label: 'Luxury Styling' },
      { id: 'svc2', label: 'Color Artistry' },
      { id: 'svc3', label: 'Creative Cuts' }
    ],
    bio: 'Specializing in transformative hair experiences with a focus on color theory and personalized styling.'
  },
  {
    id: 'a2',
    name: 'Marcus Elite',
    location: 'Colombo 7',
    image: '',
    experience: 15,
    rating: 5.0,
    specialty: 'Premium Grooming & Wellness',
    services: [
      { id: 'svc4', label: 'Signature Massage' },
      { id: 'svc5', label: 'Sports Therapy' },
      { id: 'svc6', label: 'Wellness Coaching' }
    ],
    bio: 'Elite wellness consultant with 15 years of experience in holistic grooming and therapeutic treatments.'
  },
  {
    id: 'a3',
    name: 'Isabella Spa Master',
    location: 'Galle Face',
    image: '',
    experience: 12,
    rating: 4.8,
    specialty: 'Facial & Body Treatments',
    services: [
      { id: 'svc7', label: 'Facial Artistry' },
      { id: 'svc8', label: 'Body Treatments' },
      { id: 'svc9', label: 'Ayurvedic Therapy' }
    ],
    bio: 'Master aesthetician blending traditional Ayurvedic principles with modern skincare science.'
  },
  {
    id: 'a4',
    name: 'James Beauty Expert',
    location: 'Negombo',
    image: '',
    experience: 10,
    rating: 4.7,
    specialty: 'Men\'s Grooming & Styling',
    services: [
      { id: 'svc10', label: 'Premium Grooming' },
      { id: 'svc11', label: 'Beard Design' },
      { id: 'svc12', label: 'Personal Styling' }
    ],
    bio: 'Expert in masculine aesthetics with a focus on precision grooming and beard artistry.'
  },
  {
    id: 'a5',
    name: 'Zara Wellness',
    location: 'Colombo 6',
    image: '',
    experience: 8,
    rating: 4.9,
    specialty: 'Holistic Beauty & Wellness',
    services: [
      { id: 'svc13', label: 'Holistic Beauty' },
      { id: 'svc14', label: 'Natural Treatments' },
      { id: 'svc15', label: 'Wellness Programs' }
    ],
    bio: 'Wellness coach dedicated to natural beauty enhancement and sustainable aesthetic practices.'
  },
  {
    id: 'a6',
    name: 'Dev Transformations',
    location: 'Colombo 4',
    image: '',
    experience: 11,
    rating: 4.8,
    specialty: 'Complete Image Transformation',
    services: [
      { id: 'svc16', label: 'Image Analysis' },
      { id: 'svc17', label: 'Style Consultation' },
      { id: 'svc18', label: 'Wardrobe Curation' }
    ],
    bio: 'Image consultant specializing in complete aesthetic transformations and personal brand development.'
  }
];

export const VIBE_DESCRIPTIONS = {
  Minimalist: {
    description: 'Clean, refined, and understated elegance',
    characteristics: ['Simplicity', 'Timeless', 'Sophisticated', 'Neutral palette'],
    examples: 'Minimal makeup, sleek hairstyles, neutral tones'
  },
  Opulent: {
    description: 'Luxurious, bold, and statement-making',
    characteristics: ['Glamorous', 'Rich colors', 'Textured', 'High-impact'],
    examples: 'Gold accents, voluminous hair, dramatic makeup'
  },
  'Avant-Garde': {
    description: 'Experimental, cutting-edge, and boundary-pushing',
    characteristics: ['Innovative', 'Artistic', 'Unconventional', 'Creative'],
    examples: 'Asymmetrical cuts, vibrant colors, architectural shapes'
  }
};

export const AESTHETIC_CONCERNS = [
  'Acne & Breakouts',
  'Hyperpigmentation',
  'Aging & Wrinkles',
  'Sensitivity',
  'Dryness & Dehydration',
  'Oiliness',
  'Loss of Elasticity',
  'Uneven Tone',
  'Tired Eyes',
  'Skin Texture',
  'Rosacea',
  'Other'
];

export const INTENSITY_LEVELS = [
  { value: 'Standard', description: 'Maintenance & enhancement' },
  { value: 'Advanced', description: 'Significant improvements' },
  { value: 'Intensive', description: 'Comprehensive transformation' }
];
