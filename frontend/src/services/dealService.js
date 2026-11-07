import api from './api';

// Curated high-resolution imagery per hotel category/city
export const LUXURY_HOTEL_IMAGES = {
  1: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop', // Royal Palace Bangalore
  2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop', // Ocean Suite Mumbai
  3: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop', // Beachfront Villa Goa
  4: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop', // Heritage Haveli Delhi
  default: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop'
};

export const MOCK_CURATED_DEALS = [
  {
    dealId: 1,
    mysteryTitle: 'Royal Palace Heritage Suite in Indiranagar',
    descriptionClues: 'Palatial architecture with hand-carved pillars, lush landscaped gardens, lagoon swimming pool, and bespoke 24-hour butler service.',
    city: 'Bangalore',
    zoneArea: 'Indiranagar',
    starRating: 5,
    roomCategory: 'EXECUTIVE_SUITE',
    roomTypeName: 'Maharaja Heritage Suite',
    originalPrice: 380.00,
    mysteryPrice: 228.00,
    discountPercent: 40,
    savingsAmount: 152.00,
    imageUrl: LUXURY_HOTEL_IMAGES[1],
    amenityClues: ['Private Balcony', 'Lagoon Pool', 'Spa & Wellness', 'Complimentary Champagne'],
    validFrom: '2026-11-10',
    validTo: '2026-12-15'
  },
  {
    dealId: 2,
    mysteryTitle: 'Secluded Beachfront Cliff Villa with Plunge Pool',
    descriptionClues: 'Perched along North Goa’s dramatic coast, featuring private infinity plunge pool, open-air sun deck, and direct path to secluded sand dunes.',
    city: 'Goa',
    zoneArea: 'Vagator Coast',
    starRating: 5,
    roomCategory: 'PRESIDENTIAL_SUITE',
    roomTypeName: 'Oceanfront Cliff Villa',
    originalPrice: 520.00,
    mysteryPrice: 260.00,
    discountPercent: 50,
    savingsAmount: 260.00,
    imageUrl: LUXURY_HOTEL_IMAGES[3],
    amenityClues: ['Private Plunge Pool', 'Direct Beach Access', 'Sunset Deck', 'Chef Breakfast'],
    validFrom: '2026-11-12',
    validTo: '2026-12-28'
  },
  {
    dealId: 3,
    mysteryTitle: 'High-Floor Arabian Sea Vista Suite in Bandra',
    descriptionClues: 'Floor-to-ceiling panoramic glass overlooking the Arabian Sea, Italian marble bath, heated deep-soak tub, and members-only skyline lounge access.',
    city: 'Mumbai',
    zoneArea: 'Bandra West',
    starRating: 5,
    roomCategory: 'DELUXE_ROOM',
    roomTypeName: 'Sea View Premier Room',
    originalPrice: 320.00,
    mysteryPrice: 192.00,
    discountPercent: 40,
    savingsAmount: 128.00,
    imageUrl: LUXURY_HOTEL_IMAGES[2],
    amenityClues: ['Panoramic Sea View', 'Executive Lounge', 'Marble Bath', 'Airport Limousine'],
    validFrom: '2026-11-08',
    validTo: '2026-12-20'
  },
  {
    dealId: 4,
    mysteryTitle: 'Art Deco Sanctuary near Connaught Place',
    descriptionClues: 'Colonial verandas, antique Burma teak furnishings, tranquil interior courtyard fountain, and acclaimed high-tea terrace.',
    city: 'Delhi',
    zoneArea: 'Connaught Place',
    starRating: 5,
    roomCategory: 'EXECUTIVE_SUITE',
    roomTypeName: 'Colonial Courtyard Suite',
    originalPrice: 290.00,
    mysteryPrice: 188.50,
    discountPercent: 35,
    savingsAmount: 101.50,
    imageUrl: LUXURY_HOTEL_IMAGES[4],
    amenityClues: ['Historic Courtyard', 'Art Deco Lounge', 'Michelin-Starred Dining', 'Concierge'],
    validFrom: '2026-11-15',
    validTo: '2026-12-30'
  }
];

export const dealService = {
  async getPublicDeals() {
    try {
      const response = await api.get('/deals');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data.map(deal => ({
          ...deal,
          imageUrl: LUXURY_HOTEL_IMAGES[deal.dealId] || LUXURY_HOTEL_IMAGES.default
        }));
      }
      return MOCK_CURATED_DEALS;
    } catch {
      return MOCK_CURATED_DEALS;
    }
  },

  async getDealById(dealId) {
    try {
      const response = await api.get(`/deals/${dealId}`);
      if (response.data?.data) {
        return {
          ...response.data.data,
          imageUrl: LUXURY_HOTEL_IMAGES[dealId] || LUXURY_HOTEL_IMAGES.default
        };
      }
      return MOCK_CURATED_DEALS.find(d => d.dealId === Number(dealId)) || MOCK_CURATED_DEALS[0];
    } catch {
      return MOCK_CURATED_DEALS.find(d => d.dealId === Number(dealId)) || MOCK_CURATED_DEALS[0];
    }
  },

  async createMysteryDeal(dealData) {
    const response = await api.post('/deals', dealData);
    return response.data;
  },

  async getMyDeals() {
    const response = await api.get('/deals/my');
    return response.data;
  }
};
