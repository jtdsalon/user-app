import { Salon, Artist } from './types';

export const SALONS: Salon[] = [
  {
    id: '1',
    name: 'Luxe Salon Elite',
    location: 'Colombo 7',
    category: 'Hair',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.8,
    fullServices: [
      { id: 's1', name: 'Signature Haircut', price: 5500 },
      { id: 's2', name: 'Color Treatment', price: 8500 },
      { id: 's3', name: 'Styling & Blowdry', price: 3500 },
      { id: 's4', name: 'Premium Hair Spa', price: 6500 }
    ],
    stylists: [
      { name: 'Luca Marcello', role: 'Senior Stylist', image: '', experience: 8 }
    ]
  },
  {
    id: '2',
    name: 'Serenity Zen Massage',
    location: 'Mount Lavinia',
    category: 'Spa',
    image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6eef45?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.9,
    fullServices: [
      { id: 's5', name: 'Hot Stone Therapy', price: 7500 },
      { id: 's6', name: 'Full Body Massage', price: 6000 },
      { id: 's7', name: 'Aromatherapy Session', price: 5000 },
      { id: 's8', name: 'Deep Tissue Massage', price: 6500 }
    ],
    stylists: [
      { name: 'Kamala Sharma', role: 'Wellness Expert', image: '', experience: 10 }
    ]
  },
  {
    id: '3',
    name: 'Royal Palace Spa',
    location: 'Galle Face',
    category: 'Spa',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.7,
    fullServices: [
      { id: 's9', name: 'Signature Facial', price: 9000 },
      { id: 's10', name: 'Body Scrub Ritual', price: 7500 },
      { id: 's11', name: 'Ayurvedic Treatment', price: 8500 },
      { id: 's12', name: 'Royal Foot Therapy', price: 5500 }
    ],
    stylists: [
      { name: 'Priya Desai', role: 'Spa Therapist', image: '', experience: 7 }
    ]
  },
  {
    id: '4',
    name: 'Aurora Glow Studio',
    location: 'Nugegoda',
    category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1573461160327-9ee47f7f5b5e?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.9,
    fullServices: [
      { id: 's13', name: 'Hydrafacial Pro', price: 8500 },
      { id: 's14', name: 'Chemical Peel', price: 7000 },
      { id: 's15', name: '6-Week Glow Program', price: 24000 },
      { id: 's16', name: 'Acne Clarity Treatment', price: 6500 }
    ],
    stylists: [
      { name: 'Dr. Elena Rodriguez', role: 'Skincare Specialist', image: '', experience: 12 }
    ]
  },
  {
    id: '5',
    name: 'Sanctuary Beauty Retreat',
    location: 'Unawatuna',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1570545338259-3275403ad28e?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.8,
    fullServices: [
      { id: 's17', name: 'Holistic Wellness Session', price: 9500 },
      { id: 's18', name: 'Crystal Healing Therapy', price: 6500 },
      { id: 's19', name: 'Meditation & Spa Combo', price: 8000 },
      { id: 's20', name: 'Energy Balancing', price: 5500 }
    ],
    stylists: [
      { name: 'Olivia Brooks', role: 'Wellness Coach', image: '', experience: 9 }
    ]
  },
  {
    id: '6',
    name: 'Glam Hair Studio',
    location: 'Rajagiriya',
    category: 'Hair',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 4.6,
    fullServices: [
      { id: 's21', name: 'Hair Transformation', price: 12000 },
      { id: 's22', name: 'Keratin Smoothing', price: 9500 },
      { id: 's23', name: 'Bridal Styling', price: 15000 },
      { id: 's24', name: 'Hair Extension Service', price: 8500 }
    ],
    stylists: [
      { name: 'Sophia Laurent', role: 'Lead Stylist', image: '', experience: 11 }
    ]
  }
];

export const ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'Chloe Artisan',
    location: 'Colombo 3',
    image: '',
    experience: 9,
    services: [
      { id: 'svc1', label: 'Luxury Styling' },
      { id: 'svc2', label: 'Color Artistry' },
      { id: 'svc3', label: 'Creative Cuts' }
    ],
    rating: 4.9
  },
  {
    id: 'a2',
    name: 'Marcus Elite',
    location: 'Colombo 7',
    image: '',
    experience: 15,
    services: [
      { id: 'svc4', label: 'Signature Massage' },
      { id: 'svc5', label: 'Sports Therapy' },
      { id: 'svc6', label: 'Wellness Coaching' }
    ],
    rating: 5.0
  },
  {
    id: 'a3',
    name: 'Isabella Spa Master',
    location: 'Galle Face',
    image: '',
    experience: 12,
    services: [
      { id: 'svc7', label: 'Facial Artistry' },
      { id: 'svc8', label: 'Body Treatments' },
      { id: 'svc9', label: 'Ayurvedic Therapy' }
    ],
    rating: 4.8
  },
  {
    id: 'a4',
    name: 'James Beauty Expert',
    location: 'Negombo',
    image: '',
    experience: 10,
    services: [
      { id: 'svc10', label: 'Premium Grooming' },
      { id: 'svc11', label: 'Beard Design' },
      { id: 'svc12', label: 'Personal Styling' }
    ],
    rating: 4.7
  },
  {
    id: 'a5',
    name: 'Zara Wellness',
    location: 'Colombo 6',
    image: '',
    experience: 8,
    services: [
      { id: 'svc13', label: 'Holistic Beauty' },
      { id: 'svc14', label: 'Natural Treatments' },
      { id: 'svc15', label: 'Wellness Programs' }
    ],
    rating: 4.9
  }
];
