import { USER_ROLES } from '../constants/index.js';

export const mockCampaigns = [
  {
    _id: '64b1f481c002bc001dcd1234',
    title: 'Urgent Heart Surgery Support for Ahmed',
    slug: 'urgent-heart-surgery-support-for-ahmed',
    description: 'Ahmed needs urgent open-heart surgery. Please support us in raising funds to save his life.',
    shortDescription: 'Ahmed needs urgent open-heart surgery. Please support us in raising funds to save his life.',
    category: 'Medical Assistance',
    fundingGoal: 800000,
    goalAmount: 800000,
    amountRaised: 350000,
    raisedAmount: 350000,
    location: 'Karachi, Pakistan',
    purposeOfFunds: 'Hospital charges, surgery expenses, and post-operative medications.',
    thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { _id: 'demo-user-local', fullName: 'Sayarb Foundation' },
    managerId: 'demo-user-local',
    verificationStatus: 'verified',
    lifecycleStatus: 'active',
    isEmergency: true,
    isFeatured: true,
    donorCount: 42,
    shareCount: 156,
    viewCount: 1042,
    story: {
      background: 'Ahmed, a 12-year-old from Karachi, was diagnosed with a congenital heart defect that requires immediate surgical intervention.',
      currentSituation: 'His family cannot afford the surgery costs at a private hospital. Government hospitals have a 6-month waiting list.',
      fundingNeed: 'We need PKR 800,000 for the surgery, post-operative care, and medications.',
      expectedImpact: 'This surgery will give Ahmed a chance at a normal, healthy life.',
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '64b1f481c002bc001dcd1235',
    title: 'Sponsor Higher Education for Deserving Students',
    slug: 'sponsor-higher-education-for-deserving-students',
    description: 'Support local students by sponsoring their university semester fees and textbook costs.',
    shortDescription: 'Support local students by sponsoring their university semester fees and textbook costs.',
    category: 'Education / Student Fees',
    fundingGoal: 500000,
    goalAmount: 500000,
    amountRaised: 120000,
    raisedAmount: 120000,
    location: 'Lahore, Pakistan',
    purposeOfFunds: 'Semester tuition fees payment directly to universities.',
    thumbnail: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { _id: 'demo-user-local', fullName: 'Education Foundation' },
    managerId: 'demo-user-local',
    verificationStatus: 'verified',
    lifecycleStatus: 'active',
    isEmergency: false,
    isFeatured: true,
    donorCount: 18,
    shareCount: 89,
    viewCount: 520,
    story: {
      background: 'Many talented students in Pakistan cannot pursue higher education due to financial constraints.',
      currentSituation: 'Over 50 students have applied for scholarships but lack the financial support needed for this semester.',
      fundingNeed: 'Each student needs approximately PKR 50,000 per semester for tuition and books.',
      expectedImpact: 'Your donation will directly fund university education for deserving students.',
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '64b1f481c002bc001dcd1236',
    title: 'Clean Water Initiative for Rural Communities',
    slug: 'clean-water-initiative-for-rural-communities',
    description: 'Providing clean and safe drinking water to rural villages in Sindh by installing filtration plants.',
    shortDescription: 'Providing clean and safe drinking water to rural villages in Sindh by installing filtration plants.',
    category: 'Community Development',
    fundingGoal: 1200000,
    goalAmount: 1200000,
    amountRaised: 750000,
    raisedAmount: 750000,
    location: 'Tharparkar, Sindh',
    purposeOfFunds: 'Water filtration plant installation and maintenance for the first year.',
    thumbnail: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=1200',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { _id: 'demo-user-local', fullName: 'Water for All' },
    managerId: 'demo-user-local',
    verificationStatus: 'verified',
    lifecycleStatus: 'active',
    isEmergency: false,
    isFeatured: false,
    donorCount: 65,
    shareCount: 230,
    viewCount: 2100,
    story: {
      background: 'Millions of people in rural Sindh lack access to clean drinking water.',
      currentSituation: 'Contaminated water causes widespread diseases including hepatitis and cholera.',
      fundingNeed: 'Each filtration plant costs PKR 300,000 and serves 1,000+ people.',
      expectedImpact: 'Four villages will gain access to clean, safe drinking water.',
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '64b1f481c002bc001dcd1237',
    title: 'Flood Relief for Balochistan Families',
    slug: 'flood-relief-for-balochistan-families',
    description: 'Emergency relief for families displaced by devastating floods in Balochistan province.',
    shortDescription: 'Emergency relief for families displaced by devastating floods in Balochistan province.',
    category: 'Emergency Relief',
    fundingGoal: 2000000,
    goalAmount: 2000000,
    amountRaised: 1800000,
    raisedAmount: 1800000,
    location: 'Quetta, Balochistan',
    purposeOfFunds: 'Food packages, temporary shelter, and medical supplies for 500+ families.',
    thumbnail: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=1200',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { _id: 'demo-user-local', fullName: 'Relief Pakistan' },
    managerId: 'demo-user-local',
    verificationStatus: 'emergency_verified',
    lifecycleStatus: 'active',
    isEmergency: true,
    isFeatured: true,
    donorCount: 210,
    shareCount: 580,
    viewCount: 5400,
    story: {
      background: 'Devastating floods have displaced thousands of families across Balochistan.',
      currentSituation: 'Families are living in makeshift camps with no access to food, clean water, or medical care.',
      fundingNeed: 'Immediate funds needed for emergency supplies and temporary shelters.',
      expectedImpact: 'Your donation will provide life-saving relief to 500+ displaced families.',
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '64b1f481c002bc001dcd1238',
    title: 'Orphanage Kitchen Renovation Project',
    slug: 'orphanage-kitchen-renovation-project',
    description: 'Renovating the kitchen facility at Dar-ul-Atfal orphanage to provide better nutrition for 120 children.',
    shortDescription: 'Renovating the kitchen facility at Dar-ul-Atfal orphanage to provide better nutrition for 120 children.',
    category: 'Social Welfare',
    fundingGoal: 300000,
    goalAmount: 300000,
    amountRaised: 45000,
    raisedAmount: 45000,
    location: 'Islamabad, Pakistan',
    purposeOfFunds: 'Kitchen equipment, renovation costs, and initial food supply.',
    thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { _id: 'demo-user-local', fullName: 'Orphan Care Pakistan' },
    managerId: 'demo-user-local',
    verificationStatus: 'verified',
    lifecycleStatus: 'active',
    isEmergency: false,
    isFeatured: false,
    donorCount: 8,
    shareCount: 34,
    viewCount: 180,
    story: {
      background: 'Dar-ul-Atfal orphanage houses 120 children but its kitchen is in disrepair.',
      currentSituation: 'The current kitchen cannot safely prepare meals for all children.',
      fundingNeed: 'Complete renovation including new cooking equipment and ventilation.',
      expectedImpact: '120 children will receive nutritious, safely prepared meals daily.',
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '64b1f481c002bc001dcd1239',
    title: 'Free Eye Surgery Camp in Punjab',
    slug: 'free-eye-surgery-camp-in-punjab',
    description: 'Organizing a free cataract surgery camp for elderly patients who cannot afford treatment.',
    shortDescription: 'Organizing a free cataract surgery camp for elderly patients who cannot afford treatment.',
    category: 'Medical Assistance',
    fundingGoal: 600000,
    goalAmount: 600000,
    amountRaised: 280000,
    raisedAmount: 280000,
    location: 'Faisalabad, Punjab',
    purposeOfFunds: 'Surgical supplies, doctor fees, and post-operative care kits.',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    banner: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: { _id: 'demo-user-local', fullName: 'Vision for All' },
    managerId: 'demo-user-local',
    verificationStatus: 'verified',
    lifecycleStatus: 'active',
    isEmergency: false,
    isFeatured: false,
    donorCount: 32,
    shareCount: 112,
    viewCount: 890,
    story: {
      background: 'Thousands of elderly patients in rural Punjab suffer from cataracts but cannot afford surgery.',
      currentSituation: 'Without treatment, these patients face permanent blindness.',
      fundingNeed: 'Each surgery costs approximately PKR 15,000 including all materials.',
      expectedImpact: '40 patients will receive sight-restoring cataract surgery.',
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockProducts = [
  {
    _id: '64b1f481c002bc001dcd2001',
    name: 'Sayrab Premium Hoodie',
    slug: 'sayrab-premium-hoodie',
    description: 'Premium quality cotton blend hoodie with embroidered Sayrab emblem.',
    category: 'Apparel',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Navy'],
    stock: 150,
    isActive: true,
    branding: 'platform',
    creator: 'demo-user-local',
  },
  {
    _id: '64b1f481c002bc001dcd2002',
    name: 'Sayrab Thermo Flask',
    slug: 'sayrab-thermo-flask',
    description: 'Vacuum insulated double-walled stainless steel flask to keep your drinks hot or cold.',
    category: 'Drinkware',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400'],
    sizes: [],
    colors: ['Matte Black', 'Silver'],
    stock: 200,
    isActive: true,
    branding: 'platform',
    creator: 'demo-user-local',
  }
];

export const mockStores = [];
export const mockWithdrawals = [];
export const mockUploads = [];
export const mockDonations = [];

// Helper functions for mock CRUD operations
export const inMemoryDB = {
  campaigns: {
    find: (filter = {}) => {
      let result = [...mockCampaigns];
      if (filter.isFeatured) result = result.filter(c => c.isFeatured);
      if (filter.isEmergency) result = result.filter(c => c.isEmergency);
      if (filter.category && filter.category !== 'All') result = result.filter(c => c.category === filter.category);
      if (filter.$or && filter.$or[0]?.organizer) {
        const userId = filter.$or[0].organizer;
        result = result.filter(c => c.organizer === userId || c.managerId === userId);
      }
      // Search filtering
      if (filter.search) {
        const q = filter.search.toLowerCase();
        result = result.filter(c =>
          (c.title && c.title.toLowerCase().includes(q)) ||
          (c.shortDescription && c.shortDescription.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q))
        );
      }
      // Sort
      if (filter.sort) {
        switch (filter.sort) {
          case 'oldest':
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
          case 'most_funded':
            result.sort((a, b) => (b.amountRaised || 0) - (a.amountRaised || 0));
            break;
          case 'least_funded':
            result.sort((a, b) => (a.amountRaised || 0) - (b.amountRaised || 0));
            break;
          case 'ending_soon':
            result.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            break;
          case 'most_viewed':
            result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
            break;
          case 'most_urgent':
            result.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            break;
          case 'latest':
          default:
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        }
      }
      return result;
    },
    findOne: (lookup) => {
      const slug = lookup.slug || lookup._id;
      return mockCampaigns.find(c => c.slug === slug || c._id === slug) || null;
    },
    create: (data) => {
      const newCampaign = {
        _id: 'camp_' + Math.random().toString(36).substr(2, 9),
        amountRaised: 0,
        raisedAmount: 0,
        donorCount: 0,
        shareCount: 0,
        viewCount: 0,
        verificationStatus: 'verified',
        lifecycleStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      mockCampaigns.push(newCampaign);
      return newCampaign;
    }
  },
  products: {
    find: (filter = {}) => {
      let result = [...mockProducts];
      if (filter.creator) result = result.filter(p => p.creator === filter.creator);
      if (filter.category && filter.category !== 'All') result = result.filter(p => p.category === filter.category);
      return result;
    },
    findOne: (lookup) => {
      const slug = lookup.slug || lookup._id;
      return mockProducts.find(p => p.slug === slug || p._id === slug) || null;
    },
    create: (data) => {
      const newProduct = {
        _id: 'prod_' + Math.random().toString(36).substr(2, 9),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      mockProducts.push(newProduct);
      return newProduct;
    },
    delete: (id) => {
      const index = mockProducts.findIndex(p => p._id === id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
        return true;
      }
      return false;
    }
  },
  stores: {
    findOne: (filter) => {
      const userId = filter.creator || filter.owner;
      return mockStores.find(s => s.creator === userId || s.owner === userId) || null;
    },
    create: (data) => {
      const newStore = {
        _id: 'store_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockStores.push(newStore);
      return newStore;
    }
  },
  uploads: {
    find: (filter = {}) => {
      return [...mockUploads];
    },
    create: (data) => {
      const newUpload = {
        _id: 'upload_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockUploads.push(newUpload);
      return newUpload;
    },
    delete: (id) => {
      const index = mockUploads.findIndex(u => u._id === id);
      if (index !== -1) {
        mockUploads.splice(index, 1);
        return true;
      }
      return false;
    }
  },
  withdrawals: {
    find: (filter = {}) => {
      return [...mockWithdrawals];
    },
    create: (data) => {
      const newWithdrawal = {
        _id: 'withd_' + Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockWithdrawals.push(newWithdrawal);
      return newWithdrawal;
    }
  },
  donations: {
    find: (filter = {}) => {
      return [...mockDonations];
    },
    create: (data) => {
      const newDonation = {
        _id: 'don_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...data,
      };
      mockDonations.push(newDonation);
      return newDonation;
    }
  }
};
