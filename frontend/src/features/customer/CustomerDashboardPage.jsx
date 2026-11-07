import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Lock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  AlertCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const data = await bookingService.getMyBookings();
    if (data.length > 0) {
      setBookings(data);
    } else {
      // Curated sample traveler bookings if fresh account
      setBookings([
        {
          bookingId: 101,
          bookingReference: 'BK-CONFIRMED-8291',
          status: 'CONFIRMED',
          identityRevealed: true,
          hotelName: 'The Leela Palace Indiranagar',
          hotelAddress: '23 Old Airport Road, Indiranagar, Bangalore 560008',
          hotelPhone: '+91 80 2521 1234',
          city: 'Bangalore',
          zoneArea: 'Indiranagar',
          checkInDate: '2026-11-15',
          checkOutDate: '2026-11-18',
          stayNights: 3,
          roomCount: 1,
          totalAmount: 684.00,
          roomTypeName: 'Maharaja Heritage Suite'
        }
      ]);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you wish to cancel this confirmed reservation?')) return;
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD5]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C6A66B]">
            Traveler Privé Portal
          </span>
          <h1 className="font-editorial text-4xl text-[#14251F]">
            My Trips & Stays
          </h1>
          <p className="text-xs text-[#5A626A] mt-1">
            Logged in as <strong>{user?.fullName || 'Alex Morgan'}</strong> ({user?.email})
          </p>
        </div>

        <Link
          to="/search"
          className="px-4 py-2 bg-[#14251F] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
        >
          Discover New Stays <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5A626A] animate-pulse">
          Loading reservation ledger...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E4DFD5] p-8 space-y-4">
          <Briefcase className="w-10 h-10 text-[#5A626A]/40 mx-auto" />
          <h3 className="font-editorial text-2xl text-[#14251F]">No reservations yet</h3>
          <p className="text-xs text-[#5A626A]">Explore confidential mystery deals and unlock five-star luxury.</p>
          <Link
            to="/search"
            className="inline-block px-4 py-2 bg-[#C6A66B] text-[#14251F] font-bold text-xs uppercase rounded-xl"
          >
            Explore Deals
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => (
            <div
              key={b.bookingId}
              className="bg-white rounded-3xl border border-[#E4DFD5] p-6 sm:p-8 shadow-luxury space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFECE4]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#14251F]">
                      {b.bookingReference}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-[#0D8A5E] border border-emerald-200'
                          : b.status === 'PENDING_PAYMENT'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <h3 className="font-editorial text-2xl text-[#14251F] mt-1">
                    {b.identityRevealed ? b.hotelName : '🔒 Confidential 5-Star Hotel'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#5A626A] block">Total Amount</span>
                  <span className="font-editorial text-2xl font-bold text-[#14251F]">
                    ${Number(b.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Unmasked Identity Details or Masked Notice */}
              {b.identityRevealed ? (
                <div className="bg-[#14251F] text-white p-5 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[#C6A66B] font-bold uppercase tracking-wider text-[10px]">
                    <span>Revealed Hotel Coordinates</span>
                    <span>5-Star Verified</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/80">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#C6A66B] shrink-0 mt-0.5" />
                      <span>{b.hotelAddress || `${b.city}, ${b.zoneArea}`}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#C6A66B] shrink-0 mt-0.5" />
                      <span>Concierge: {b.hotelPhone || '+91 80 2521 1234'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#E4DFD5] text-xs text-[#5A626A] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C6A66B] shrink-0" />
                  <span>Hotel identity remains masked until payment confirmation.</span>
                </div>
              )}

              {/* Stay Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#5A626A] block">Dates</span>
                  <span className="font-semibold text-[#14251F]">{b.checkInDate} → {b.checkOutDate}</span>
                </div>
                <div>
                  <span className="text-[#5A626A] block">Duration</span>
                  <span className="font-semibold text-[#14251F]">{b.stayNights} Nights</span>
                </div>
                <div>
                  <span className="text-[#5A626A] block">Rooms</span>
                  <span className="font-semibold text-[#14251F]">{b.roomCount} Suite</span>
                </div>
                <div className="flex items-center justify-end">
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(b.bookingId)}
                      disabled={actionLoading}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Cancel Stay
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardPage;
