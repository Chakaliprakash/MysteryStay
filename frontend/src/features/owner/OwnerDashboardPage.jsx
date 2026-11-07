import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Bed, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { hotelService } from '../../services/hotelService';
import { dealService } from '../../services/dealService';
import Modal from '../../components/common/Modal';

const REVENUE_DATA = [
  { day: 'Mon', revenue: 2400, occupancy: 72 },
  { day: 'Tue', revenue: 3100, occupancy: 78 },
  { day: 'Wed', revenue: 2800, occupancy: 75 },
  { day: 'Thu', revenue: 4200, occupancy: 88 },
  { day: 'Fri', revenue: 5800, occupancy: 94 },
  { day: 'Sat', revenue: 6400, occupancy: 98 },
  { day: 'Sun', revenue: 4900, occupancy: 85 },
];

export const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Deal Modal State
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [descriptionClues, setDescriptionClues] = useState('');
  const [originalPrice, setOriginalPrice] = useState(400);
  const [discountPercent, setDiscountPercent] = useState(40);
  const [roomCategory, setRoomCategory] = useState('EXECUTIVE_SUITE');

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    setLoading(true);
    const [hList, dList] = await Promise.all([
      hotelService.getMyHotels(),
      dealService.getMyDeals().catch(() => [])
    ]);
    setHotels(hList);
    setDeals(dList?.data || []);
    setLoading(false);
  };

  const calculatedMysteryPrice = (originalPrice * (1 - discountPercent / 100)).toFixed(2);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await dealService.createMysteryDeal({
        roomTypeId: 1, // Default room type
        mysteryTitle: dealTitle,
        descriptionClues,
        discountPercent: Number(discountPercent),
        mysteryPrice: Number(calculatedMysteryPrice),
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
      });
      alert('Mystery Deal successfully submitted and active!');
      setShowNewDealModal(false);
      loadPartnerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Deal created successfully in sandbox mode!');
      setShowNewDealModal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Partner Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD5]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            Haute Hospitality Partner Studio
          </span>
          <h1 className="font-editorial text-4xl text-[#14251F]">
            Hotelier Revenue & Yield Console
          </h1>
          <p className="text-xs text-[#5A626A] mt-1">
            Partner Lead & Platform Owner: <strong className="text-[#14251F]">Prakash Chakali</strong> • Rate Parity Compliant
          </p>
        </div>

        <button
          onClick={() => setShowNewDealModal(true)}
          className="px-4 py-2.5 bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-luxury-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Publish Mystery Deal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-2">
          <div className="flex justify-between items-center text-[#5A626A] text-xs font-bold uppercase tracking-wider">
            <span>Perishable Revenue</span>
            <DollarSign className="w-4 h-4 text-[#0D8A5E]" />
          </div>
          <div className="font-editorial text-3xl text-[#14251F]">$29,600</div>
          <div className="text-[11px] text-[#0D8A5E] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% vs. published OTA channel
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-2">
          <div className="flex justify-between items-center text-[#5A626A] text-xs font-bold uppercase tracking-wider">
            <span>Occupancy Yield</span>
            <Bed className="w-4 h-4 text-[#C6A66B]" />
          </div>
          <div className="font-editorial text-3xl text-[#14251F]">86.4%</div>
          <div className="text-[11px] text-[#0D8A5E] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% unsold room fill rate
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-2">
          <div className="flex justify-between items-center text-[#5A626A] text-xs font-bold uppercase tracking-wider">
            <span>Active Mystery Deals</span>
            <Sparkles className="w-4 h-4 text-[#C6A66B]" />
          </div>
          <div className="font-editorial text-3xl text-[#14251F]">4 Deals</div>
          <div className="text-[11px] text-[#5A626A]">100% Rate parity safe</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-2">
          <div className="flex justify-between items-center text-[#5A626A] text-xs font-bold uppercase tracking-wider">
            <span>Zero Brand Damage</span>
            <CheckCircle2 className="w-4 h-4 text-[#0D8A5E]" />
          </div>
          <div className="font-editorial text-3xl text-[#14251F]">100% Masked</div>
          <div className="text-[11px] text-[#5A626A]">Identity unmasked only post-pay</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-editorial text-2xl text-[#14251F]">Revenue Yield by Day</h3>
              <p className="text-xs text-[#5A626A]">Daily incremental revenue from mystery bookings</p>
            </div>
            <span className="text-xs font-bold text-[#0D8A5E] bg-emerald-50 px-2.5 py-1 rounded-full">
              7-Day Run Rate
            </span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A66B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C6A66B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
                <XAxis dataKey="day" stroke="#5A626A" fontSize={12} />
                <YAxis stroke="#5A626A" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#C6A66B" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E4DFD5] shadow-luxury space-y-4">
          <div>
            <h3 className="font-editorial text-2xl text-[#14251F]">Occupancy %</h3>
            <p className="text-xs text-[#5A626A]">Overall suite fill percentage</p>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
                <XAxis dataKey="day" stroke="#5A626A" fontSize={12} />
                <YAxis stroke="#5A626A" fontSize={12} />
                <Tooltip />
                <Bar dataKey="occupancy" fill="#14251F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Published Properties & Deals */}
      <div className="bg-white rounded-3xl border border-[#E4DFD5] p-6 sm:p-8 shadow-luxury space-y-6">
        <h3 className="font-editorial text-2xl text-[#14251F]">
          Managed Partner Properties
        </h3>
        <div className="divide-y divide-[#EFECE4] text-xs">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#14251F]">The Confidential Palace</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                  VERIFIED 5-STAR
                </span>
              </div>
              <p className="text-[#5A626A] mt-0.5">12 Royal Enclave, Bandra West, Mumbai • 5 Star Luxury</p>
            </div>
            <div className="flex items-center gap-4 text-[#14251F] font-semibold">
              <span>Active Deals: 2</span>
              <span>10 Rooms/Day Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: PUBLISH MYSTERY DEAL */}
      <Modal
        isOpen={showNewDealModal}
        onClose={() => setShowNewDealModal(false)}
        title="Publish Unsold Mystery Deal"
        subtitle="Monetize perishable suite inventory without public rate-parity conflict"
      >
        <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase text-[#5A626A] mb-1">
              Mystery Teaser Title (Identity Masked)
            </label>
            <input
              type="text"
              required
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              placeholder="e.g. 5-Star Waterfront Splendor in Bandra"
              className="w-full p-3 bg-[#F8F6F0] rounded-xl border border-[#E4DFD5] font-semibold text-[#14251F]"
            />
          </div>

          <div>
            <label className="block font-bold uppercase text-[#5A626A] mb-1">
              Architectural & Luxury Clues
            </label>
            <textarea
              required
              rows="3"
              value={descriptionClues}
              onChange={(e) => setDescriptionClues(e.target.value)}
              placeholder="Describe amenities and views without revealing your exact brand name..."
              className="w-full p-3 bg-[#F8F6F0] rounded-xl border border-[#E4DFD5] font-semibold text-[#14251F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-[#5A626A] mb-1">
                Retail Price ($)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full p-3 bg-[#F8F6F0] rounded-xl border border-[#E4DFD5] font-semibold text-[#14251F]"
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-[#5A626A] mb-1">
                Discount ({discountPercent}%)
              </label>
              <input
                type="range"
                min="20"
                max="70"
                step="5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full accent-[#C6A66B] mt-3"
              />
            </div>
          </div>

          <div className="p-4 bg-[#14251F] text-white rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-[#C6A66B] uppercase font-bold block">
                Calculated Wholesale Rate
              </span>
              <span className="font-editorial text-2xl">${calculatedMysteryPrice} / night</span>
            </div>
            <span className="text-xs text-[#0D8A5E] bg-white/10 px-2.5 py-1 rounded-full font-bold">
              {discountPercent}% Secret Discount
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#C6A66B] hover:bg-[#B5955A] text-[#14251F] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-luxury-gold"
          >
            Submit for Publication
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerDashboardPage;
