import { Salon, FeedPost } from './types';

export const SALONS: Salon[] = [
  {
    id: 'salon-1',
    name: 'Luminous Beauty Studio',
    image: 'https://images.unsplash.com/photo-1562110503-3810c687a155?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=1200&h=400&fit=crop',
    location: 'Downtown, San Francisco',
    status: 'online',
    isVerified: true,
    rating: 4.8,
    clients: 1500,
    experience: 'Where artistry meets transformation. We believe every ritual is a journey toward self-discovery and radiant confidence.',
    reviews: [
      {
        id: 'review-1',
        userName: 'Sarah Mitchell',
        userAvatar: '',
        rating: 5,
        comment: 'Absolutely amazing experience! The attention to detail is incredible. I felt pampered and transformed.',
        date: '2 weeks ago',
        serviceAttended: 'Signature Glow Facial'
      },
      {
        id: 'review-2',
        userName: 'Jessica Chen',
        userAvatar: '',
        rating: 5,
        comment: 'Best haircut I\'ve ever had. The stylist really understood my vision and executed it perfectly.',
        date: '1 month ago',
        serviceAttended: 'Precision Cut & Style'
      },
      {
        id: 'review-3',
        userName: 'Emma Rodriguez',
        userAvatar: '',
        rating: 4,
        comment: 'Great service, beautiful studio. A bit pricey but worth it for the quality.',
        date: '6 weeks ago',
        serviceAttended: 'Luxury Manicure'
      }
    ],
    fullServices: [
      {
        id: 'service-1',
        name: 'Signature Glow Facial',
        description: 'Deep cleansing facial with premium serums and LED light therapy for radiant skin',
        category: 'Facials',
        price: 120,
        duration: '60 min'
      },
      {
        id: 'service-2',
        name: 'Hydration Boost',
        description: 'Intensive hydrating treatment with hyaluronic acid and oxygen infusion',
        category: 'Facials',
        price: 95,
        duration: '45 min'
      },
      {
        id: 'service-3',
        name: 'Anti-Aging Renewal',
        description: 'Advanced anti-aging facial with collagen and peptide complex',
        category: 'Facials',
        price: 140,
        duration: '75 min'
      },
      {
        id: 'service-4',
        name: 'Precision Cut & Style',
        description: 'Expert haircut tailored to your face shape with professional styling',
        category: 'Hair',
        price: 85,
        duration: '60 min'
      },
      {
        id: 'service-5',
        name: 'Balayage Highlights',
        description: 'Hand-painted highlights for a natural, sun-kissed look',
        category: 'Hair',
        price: 160,
        duration: '150 min'
      },
      {
        id: 'service-6',
        name: 'Keratin Smoothing Treatment',
        description: 'Transform frizzy hair into silky smooth locks',
        category: 'Hair',
        price: 180,
        duration: '180 min'
      },
      {
        id: 'service-7',
        name: 'Luxury Manicure',
        description: 'Premium manicure with organic polish and hand massage',
        category: 'Nails',
        price: 55,
        duration: '45 min'
      },
      {
        id: 'service-8',
        name: 'Gel Extensions',
        description: 'Beautiful gel nail extensions with custom design',
        category: 'Nails',
        price: 65,
        duration: '60 min'
      },
      {
        id: 'service-9',
        name: 'Full Body Massage',
        description: 'Relaxing full body massage with aromatherapy oils',
        category: 'Spa',
        price: 110,
        duration: '90 min'
      },
      {
        id: 'service-10',
        name: 'Hot Stone Therapy',
        description: 'Therapeutic massage using heated stones for deep relaxation',
        category: 'Spa',
        price: 135,
        duration: '75 min'
      }
    ],
    branches: [
      {
        id: 'branch-1',
        name: 'Downtown Studio',
        address: '456 Market Street',
        city: 'San Francisco, CA 94102',
        phone: '+1 (415) 555-0101',
        hours: '9:00 AM - 8:00 PM'
      },
      {
        id: 'branch-2',
        name: 'Marina Bay Studio',
        address: '789 Bay Street',
        city: 'San Francisco, CA 94115',
        phone: '+1 (415) 555-0102',
        hours: '9:00 AM - 7:00 PM'
      }
    ],
    stylists: [
      {
        id: 'stylist-1',
        name: 'Adriana',
        initials: 'AV',
        role: 'Master Stylist',
        specialization: 'Hair & Color'
      },
      {
        id: 'stylist-2',
        name: 'Lucia',
        initials: 'LS',
        role: 'Skincare Artist',
        specialization: 'Facials & Treatments'
      },
      {
        id: 'stylist-3',
        name: 'Marina',
        initials: 'MR',
        role: 'Nail Technician',
        specialization: 'Nail Art & Extensions'
      },
      {
        id: 'stylist-4',
        name: 'Sofia',
        initials: 'SC',
        role: 'Wellness Specialist',
        specialization: 'Massage & Spa'
      }
    ],
    offers: [
      {
        id: 'offer-1',
        title: 'New Member Welcome',
        description: '20% off your first service when you book with us',
        discountPercentage: 20,
        expiresAt: '2026-02-28'
      }
    ]
  },
  {
    id: 'salon-2',
    name: 'Zenith Salon & Wellness',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1570722675135-f9e0db8e2ba2?w=1200&h=400&fit=crop',
    location: 'Marina District, San Francisco',
    status: 'offline',
    isVerified: true,
    rating: 4.6,
    clients: 1200,
    experience: 'Holistic beauty experiences designed to elevate your natural essence and celebrate your unique brilliance.',
    reviews: [
      {
        id: 'review-4',
        userName: 'Michael Chen',
        userAvatar: '',
        rating: 5,
        comment: 'Fantastic massage therapy. Very professional and relaxing environment.',
        date: '3 weeks ago',
        serviceAttended: 'Full Body Massage'
      },
      {
        id: 'review-5',
        userName: 'Amanda White',
        userAvatar: '',
        rating: 4,
        comment: 'Good experience overall. Staff was friendly and knowledgeable.',
        date: '2 months ago',
        serviceAttended: 'Hydration Boost Facial'
      }
    ],
    fullServices: [
      {
        id: 'service-11',
        name: 'Wellness Consultation',
        description: 'Personalized wellness assessment and beauty plan',
        category: 'Consultation',
        price: 50,
        duration: '30 min'
      },
      {
        id: 'service-12',
        name: 'Organic Facial',
        description: 'Pure organic skincare facial with natural ingredients',
        category: 'Facials',
        price: 105,
        duration: '60 min'
      },
      {
        id: 'service-13',
        name: 'Aromatherapy Massage',
        description: 'Relaxing massage with essential oil aromatherapy',
        category: 'Spa',
        price: 100,
        duration: '60 min'
      },
      {
        id: 'service-14',
        name: 'Natural Hair Treatment',
        description: 'Nourishing hair treatment with plant-based products',
        category: 'Hair',
        price: 75,
        duration: '45 min'
      }
    ],
    branches: [
      {
        id: 'branch-3',
        name: 'Main Studio',
        address: '123 Marina Boulevard',
        city: 'San Francisco, CA 94123',
        phone: '+1 (415) 555-0201',
        hours: '10:00 AM - 9:00 PM'
      }
    ],
    stylists: [
      {
        id: 'stylist-5',
        name: 'Priya',
        initials: 'PK',
        role: 'Wellness Coach',
        specialization: 'Holistic Care'
      },
      {
        id: 'stylist-6',
        name: 'Jasmine',
        initials: 'JM',
        role: 'Massage Therapist',
        specialization: 'Therapeutic Massage'
      }
    ],
    offers: [
      {
        id: 'offer-2',
        title: 'Wellness Package',
        description: 'Book 3 services and get 15% off the entire package',
        discountPercentage: 15,
        expiresAt: '2026-03-15'
      }
    ]
  },
  {
    id: 'salon-3',
    name: 'Elegant Transformations',
    image: 'https://images.unsplash.com/photo-1544717278-ca5e3cff26b5?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
    location: 'Hayes Valley, San Francisco',
    status: 'online',
    isVerified: true,
    rating: 4.9,
    clients: 2000,
    experience: 'Luxury beauty sanctuary where timeless elegance meets modern innovation. Your transformation awaits.',
    reviews: [
      {
        id: 'review-6',
        userName: 'Catherine Park',
        userAvatar: '',
        rating: 5,
        comment: 'Absolutely stunning! The team is incredibly talented and the atmosphere is luxurious.',
        date: '1 week ago',
        serviceAttended: 'Balayage Highlights'
      },
      {
        id: 'review-7',
        userName: 'Victoria López',
        userAvatar: '',
        rating: 5,
        comment: 'Best beauty experience of my life. Highly recommend!',
        date: '3 days ago',
        serviceAttended: 'Full Transformation Package'
      },
      {
        id: 'review-8',
        userName: 'Nicole Anderson',
        userAvatar: '',
        rating: 5,
        comment: 'Impeccable service, beautiful results, wonderful staff.',
        date: '5 days ago',
        serviceAttended: 'Precision Cut & Style'
      }
    ],
    fullServices: [
      {
        id: 'service-15',
        name: 'Full Transformation Package',
        description: 'Complete beauty transformation including hair, makeup, and skincare',
        category: 'Packages',
        price: 350,
        duration: '240 min'
      },
      {
        id: 'service-16',
        name: 'Luxury Bridal Package',
        description: 'Comprehensive bridal beauty preparation and styling',
        category: 'Packages',
        price: 400,
        duration: '300 min'
      },
      {
        id: 'service-17',
        name: 'Premium Color Correction',
        description: 'Expert color correction and custom shade matching',
        category: 'Hair',
        price: 200,
        duration: '180 min'
      },
      {
        id: 'service-18',
        name: 'Diamond Facial',
        description: 'Luxury facial with diamond powder and gold infusion',
        category: 'Facials',
        price: 180,
        duration: '90 min'
      }
    ],
    branches: [
      {
        id: 'branch-4',
        name: 'Hayes Valley Flagship',
        address: '234 Hayes Street',
        city: 'San Francisco, CA 94102',
        phone: '+1 (415) 555-0301',
        hours: '9:00 AM - 9:00 PM'
      }
    ],
    stylists: [
      {
        id: 'stylist-7',
        name: 'Isabella',
        initials: 'IR',
        role: 'Creative Director',
        specialization: 'Color & Transformation'
      },
      {
        id: 'stylist-8',
        name: 'Alexandra',
        initials: 'AB',
        role: 'Master Stylist',
        specialization: 'Bridal & Special Events'
      }
    ],
    offers: [
      {
        id: 'offer-3',
        title: 'Transformation Special',
        description: 'Book any package service and receive a complimentary skincare consultation',
        discountPercentage: 0,
        expiresAt: '2026-02-15'
      }
    ]
  }
];

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    userId: 'salon-1',
    userType: 'salon',
    user: {
      id: 'salon-1',
      name: 'Luminous Beauty Studio',
      avatar: ''
    },
    content: 'Golden hour glow-up ✨ This transformation speaks for itself. Our signature glow facial leaves you absolutely radiant!',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&h=600&fit=crop',
    createdAt: '2 days ago',
    likes: 342,
    comments: 28,
    isLiked: false
  },
  {
    id: 'post-2',
    userId: 'salon-1',
    userType: 'salon',
    user: {
      id: 'salon-1',
      name: 'Luminous Beauty Studio',
      avatar: ''
    },
    content: 'New arrival: Our exclusive diamond-infused serum is finally here! Experience luxury skincare like never before 💎',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop',
    createdAt: '5 days ago',
    likes: 512,
    comments: 64,
    isLiked: true
  },
  {
    id: 'post-3',
    userId: 'salon-3',
    userType: 'salon',
    user: {
      id: 'salon-3',
      name: 'Elegant Transformations',
      avatar: ''
    },
    content: 'Before & After magic ✨ Our master colorist crafted this custom shade for a bridal transformation. Pure artistry!',
    images: [
      'https://images.unsplash.com/photo-1546959915-79df47f6db41?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516313173173-a5ce8dd55df9?w=600&h=600&fit=crop'
    ],
    createdAt: '1 week ago',
    likes: 898,
    comments: 125,
    isLiked: false
  },
  {
    id: 'post-4',
    userId: 'salon-2',
    userType: 'salon',
    user: {
      id: 'salon-2',
      name: 'Zenith Salon & Wellness',
      avatar: ''
    },
    content: 'Zen vibes 🧘‍♀️ Our new wellness retreat package is designed for ultimate relaxation. Book your escape today!',
    image: 'https://images.unsplash.com/photo-1556136212-01a14ee91fcf?w=600&h=600&fit=crop',
    createdAt: '10 days ago',
    likes: 276,
    comments: 42,
    isLiked: false
  },
  {
    id: 'post-5',
    userId: 'salon-1',
    userType: 'salon',
    user: {
      id: 'salon-1',
      name: 'Luminous Beauty Studio',
      avatar: ''
    },
    content: 'Meet our artisan team! Skilled, passionate, and dedicated to your beauty metamorphosis. Your glow-up starts here 🌟',
    image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=600&h=600&fit=crop',
    createdAt: '2 weeks ago',
    likes: 421,
    comments: 89,
    isLiked: false
  }
];
