import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { TravelItinerary, DayPlan, Activity, Recommendation } from '../types';
import { MapPin, Clock, DollarSign, Lightbulb, Coffee, Hotel, Truck, Compass, Instagram, ChevronLeft, Sparkles, Filter, X, Download, Printer, Banknote, Star, Quote } from 'lucide-react';
import TravelMap from './Map/TravelMap';

const EXCHANGE_RATES: Record<string, number> = {
  'USD': 25400, '$': 25400,
  'KRW': 18.5, '₩': 18.5,
  'JPY': 165, '¥': 165,
  'EUR': 27500, '€': 27500,
  'THB': 700, '฿': 700,
  'SGD': 19000,
  'TWD': 780,
  'CNY': 3500,
  'HKD': 3250,
  'GBP': 32000, '£': 32000,
  'AUD': 16800,
  'CAD': 18600,
  'IDR': 1.6,
  'MYR': 5400,
  'PHP': 440,
};

const convertToVND = (costStr: string) => {
  if (!costStr) return 'Miễn phí';
  const lower = costStr.toLowerCase();
  
  // Quick check for free/zero
  if (
    lower.includes('miễn phí') || 
    lower.includes('free') || 
    (lower.match(/\b0\b/) && costStr.length < 10)
  ) {
    return 'Miễn phí';
  }
  
  const upperCost = costStr.toUpperCase();
  
  // Sort keys by length descending to match longer strings first (e.g. 'THB' before 'B')
  const keys = Object.keys(EXCHANGE_RATES).sort((a, b) => b.length - a.length);
  
  let selectedRate = 0;
  let detectedSymbol = '';

  for (const symbol of keys) {
    if (upperCost.includes(symbol)) {
      selectedRate = EXCHANGE_RATES[symbol];
      detectedSymbol = symbol;
      break;
    }
  }
  
  // If no international rate found, or already explicitly in VND, return as is
  if (selectedRate === 0 || upperCost.includes('VND') || upperCost.includes('VNĐ')) {
    return costStr;
  }
  
  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Improved regex: handles numbers with commas/dots as separators
  // Matches "1,200", "50.5", "1000", etc.
  let result = costStr;
  
  // Replacement logic: Find numbers and replace with converted VND
  // We use a regex that looks specifically for patterns that look like prices
  result = result.replace(/(\d[\d,.]*)/g, (match) => {
    // Clean the number string for parsing
    // If it ends with a dot or comma, we should keep that punctuation as part of the text
    let punctuation = '';
    let cleanMatch = match;
    if (match.endsWith('.') || match.endsWith(',')) {
      punctuation = match.slice(-1);
      cleanMatch = match.slice(0, -1);
    }

    // Heuristic: if match is just a small number like 1-31, it might be a date part, but in costStr it's unlikely
    // We replace it if it feels like a value
    const valStr = cleanMatch.replace(/,/g, '');
    const num = parseFloat(valStr);
    
    if (isNaN(num)) return match;
    
    // Only convert if it's not a year (very loose check)
    if (num > 1900 && num < 2100 && !costStr.includes('/')) {
       // Might be a year, potentially skip? For now, we assume all numbers in costStr are prices.
    }

    return formatVND(num * selectedRate) + punctuation;
  });

  // Cleanup original symbols and currency codes
  // We escape symbols for regex safety
  for (const symbol of keys) {
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b|${escaped}`, 'gi');
    result = result.replace(regex, '');
  }

  // Final cleanup of extra spaces or leftover artifacts
  result = result.replace(/\s+/g, ' ').trim();
  
  return result || costStr;
};

interface ItineraryDisplayProps {
  itinerary: TravelItinerary;
  onBack: () => void;
}

type ActivityTypeFilter = 'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Nightlife';

export default function ItineraryDisplay({ itinerary, onBack }: ItineraryDisplayProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [activeType, setActiveType] = useState<ActivityTypeFilter>('All');
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [isVND, setIsVND] = useState(false);

  const displayCost = (cost: string) => isVND ? convertToVND(cost) : cost;

  const filteredDays = useMemo(() => {
    return itinerary.days.map(day => ({
      ...day,
      activities: day.activities.filter(activity => {
        const typeMatch = activeType === 'All' || activity.type === activeType;
        return typeMatch;
      })
    })).filter(day => day.activities.length > 0);
  }, [itinerary.days, activeType]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(itinerary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `Lich_trinh_${itinerary.overview.destination.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-vibrant-cream overflow-x-hidden print:bg-white print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break-inside-avoid { break-inside: avoid; }
          .print-grid { display: block !important; }
          header { position: absolute !important; }
          main { display: block !important; height: auto !important; padding-top: 2rem !important; }
          section { width: 100% !important; height: auto !important; overflow: visible !important; position: static !important; }
          .brutalist-card { border-color: #000 !important; box-shadow: none !important; }
          .printable-content { padding: 2rem !important; }
        }
      `}</style>

      {/* HEADER NAVIGATION */}
      <header className="fixed top-0 inset-x-0 z-[100] px-6 py-4 bg-white/80 backdrop-blur-md border-b-2 border-vibrant-black shadow-sm no-print">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 border-2 border-vibrant-black rounded-xl hover:bg-vibrant-black hover:text-white transition-all shadow-[2px_2px_0px_#1a1a1a] hover:shadow-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-display uppercase tracking-tight">{itinerary.overview.destination}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                {itinerary.overview.duration} • {itinerary.overview.travelStyle}
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-2">
            {itinerary.days.map(d => (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                  activeDay === d.day 
                    ? 'bg-vibrant-orange text-white border-vibrant-black shadow-[4px_4px_0px_#1a1a1a]' 
                    : 'bg-white border-vibrant-black/10 hover:border-vibrant-black'
                }`}
              >
                Ngày {d.day}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsVND(!isVND)}
              title={isVND ? "Xem giá gốc" : "Đổi sang VNĐ"}
              className={`flex items-center gap-2 px-4 py-3 border-2 border-vibrant-black rounded-xl transition-all shadow-[2px_2px_0px_#1a1a1a] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${isVND ? 'bg-vibrant-green text-white' : 'bg-white text-vibrant-black'}`}
            >
              <Banknote className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{isVND ? 'VNĐ' : 'Gốc'}</span>
            </button>
            <button 
              onClick={handleExportJSON}
              title="Tải xuống JSON"
              className="p-3 bg-vibrant-yellow border-2 border-vibrant-black rounded-xl transition-all shadow-[2px_2px_0px_#1a1a1a] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={handlePrint}
              title="Lưu PDF / In"
              className="p-3 bg-white border-2 border-vibrant-black rounded-xl transition-all shadow-[2px_2px_0px_#1a1a1a] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="flex flex-col lg:flex-row h-screen pt-24">
        
        {/* LEFT COLUMN: ITINERARY FLOW (SCROLLABLE) */}
        <section className="w-full lg:w-[40%] xl:w-[35%] h-full overflow-y-auto p-6 space-y-12 pb-32 no-scrollbar printable-content">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-display uppercase tracking-widest bg-vibrant-yellow px-4 py-2 border-2 border-vibrant-black rotate-[-1deg] shadow-[4px_4px_0px_#1a1a1a]">Kế Hoạch Tổng Thể</h2>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-2 no-print">
              {(['All', 'Morning', 'Afternoon', 'Evening', 'Nightlife'] as ActivityTypeFilter[]).map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 transition-all ${
                    activeType === type 
                      ? 'bg-vibrant-orange text-white border-vibrant-black shadow-[2px_2px_0px_#1a1a1a]' 
                      : 'bg-white border-vibrant-black/10 hover:border-vibrant-black hover:shadow-sm'
                  }`}
                >
                  {type === 'All' ? 'Tất cả' : type === 'Morning' ? 'Sáng' : type === 'Afternoon' ? 'Chiều' : type === 'Evening' ? 'Tối' : 'Đêm'}
                </button>
              ))}
            </div>
          </div>

          {/* DAY SCROLL */}
          <div className="space-y-16">
            {filteredDays.filter(d => (activeDay === d.day || typeof window !== 'undefined' && window.matchMedia('print').matches)).map((day) => (
              <div key={day.day} className="print:break-inside-avoid print:mb-12">
                <DayBlock 
                  day={day} 
                  onSelect={setSelectedLocation}
                  isVND={isVND}
                  displayCost={displayCost}
                />
              </div>
            ))}
          </div>

          {/* RECOMMENDATIONS */}
          <div className="pt-12 border-t-2 border-vibrant-black/5 space-y-8 print:break-inside-avoid">
             <div className="brutalist-card p-6 bg-vibrant-green text-white">
                <h3 className="text-2xl font-display uppercase mb-4 italic">Điểm nóng <span className="text-vibrant-yellow font-sans">Ẩm thực</span></h3>
                <div className="space-y-4 print:grid print:grid-cols-2 print:gap-4">
                  {itinerary.foodAndCafes.map(food => (
                    <div 
                      key={food.name} 
                      onClick={() => setSelectedLocation(food)}
                      className="flex gap-4 cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/20">
                        <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm uppercase text-vibrant-yellow">{food.name}</h4>
                        <p className="text-[10px] opacity-70 line-clamp-1">{food.description}</p>
                        <div className="mt-1 flex gap-1">
                          {food.signatureDishes?.slice(0, 2).map(d => (
                            <span key={d} className="text-[7px] bg-white/20 px-1 rounded font-black">{d}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* RIGHT COLUMN: INTERACTIVE MAP (STICKY) */}
        <section className="w-full lg:w-[60%] xl:w-[65%] h-[50vh] lg:h-full p-6 relative no-print">
          <TravelMap 
            itinerary={itinerary} 
            activeDay={activeDay} 
            onLocationSelect={setSelectedLocation}
          />
        </section>

      </main>

      {/* LOCATION DETAIL MODAL / DRAWER */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-vibrant-black/80 backdrop-blur-xl"
            onClick={() => setSelectedLocation(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white max-w-4xl w-full rounded-[2.5rem] border-4 border-vibrant-black shadow-[16px_16px_0px_#1a1a1a] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="relative w-full md:w-1/2 h-64 md:h-auto border-b-4 md:border-b-0 md:border-r-4 border-vibrant-black overflow-hidden bg-vibrant-black">
                <img 
                  src={selectedLocation.imageUrl || `https://picsum.photos/seed/${selectedLocation.name}/800/600`} 
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700" 
                  alt={selectedLocation.name}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-vibrant-black via-vibrant-black/40 to-transparent p-8">
                  <span className="inline-block px-3 py-1 bg-vibrant-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3 shadow-[2px_2px_0px_#1a1a1a]">
                    {selectedLocation.type || 'Trải Nghiệm'}
                  </span>
                  <h2 className="text-4xl lg:text-5xl font-display uppercase text-white leading-none tracking-tighter drop-shadow-lg">
                    {selectedLocation.name}
                  </h2>
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto no-scrollbar space-y-8 bg-vibrant-cream/30">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-vibrant-black/40">Thông tin chi tiết</p>
                    <div className="flex items-center gap-2 text-vibrant-orange font-display text-xl">
                      <Sparkles className="w-5 h-5 shine" />
                      <span>{selectedLocation.location || 'Điểm đến đề xuất'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedLocation(null)}
                    className="p-2 bg-vibrant-yellow border-2 border-vibrant-black rounded-lg shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Story / Description */}
                  <div className="space-y-3">
                    <p className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2 text-vibrant-black">
                      <Compass className="w-4 h-4 text-vibrant-orange" /> Câu Chuyện
                    </p>
                    <p className="text-sm leading-relaxed text-vibrant-black/80 font-medium">
                      {selectedLocation.description}
                    </p>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-2 border-vibrant-black/10 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1 opacity-50">
                        <DollarSign className="w-3 h-3" />
                        <p className="text-[8px] font-black uppercase">Chi Phí</p>
                      </div>
                      <p className="text-sm font-black text-vibrant-black">{displayCost(selectedLocation.cost || selectedLocation.priceRange || 'Miễn Phí')}</p>
                    </div>
                    <div className="bg-white border-2 border-vibrant-black/10 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1 opacity-50">
                        <Clock className="w-3 h-3" />
                        <p className="text-[8px] font-black uppercase">Thời Lượng</p>
                      </div>
                      <p className="text-sm font-black text-vibrant-black">{selectedLocation.duration || 'Linh Hoạt'}</p>
                    </div>
                  </div>

                  {/* Tips or Advantages */}
                  {(selectedLocation.tips || selectedLocation.advantages) && (
                    <div className="bg-vibrant-yellow/10 border-2 border-vibrant-yellow border-dashed p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Lightbulb className="w-12 h-12 text-vibrant-orange" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-vibrant-orange mb-2 flex items-center gap-2">
                        {selectedLocation.tips ? 'Mẹo Du Mục' : 'Ưu Điểm Nổi Bật'}
                      </p>
                      <p className="text-xs italic leading-relaxed text-vibrant-black/90 font-bold">
                        {selectedLocation.tips || selectedLocation.advantages}
                      </p>
                    </div>
                  )}

                  {/* Signature Dishes */}
                  {selectedLocation.signatureDishes && (
                    <div className="space-y-3">
                      <p className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2 text-vibrant-black">
                        <Coffee className="w-4 h-4 text-vibrant-orange" /> Món Đặc Trưng
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.signatureDishes.map((dish: string) => (
                          <span key={dish} className="px-3 py-1 bg-white border-2 border-vibrant-black/5 rounded-lg text-[10px] font-black uppercase text-vibrant-black/60 italic">
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ratings & Reviews */}
                  <div className="space-y-6 pt-6 border-t-2 border-vibrant-black/5">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2 text-vibrant-black">
                        <Star className="w-4 h-4 text-vibrant-yellow fill-vibrant-yellow" /> Đánh giá & Nhận xét
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-display text-vibrant-black">4.8</span>
                        <span className="text-[10px] font-black text-vibrant-black/40">/ 5</span>
                      </div>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="grid grid-cols-1 gap-2 bg-vibrant-cream/50 p-4 rounded-2xl border-2 border-vibrant-black/5">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-8">
                            <span className="text-[10px] font-black">{star}</span>
                            <Star className="w-2.5 h-2.5 text-vibrant-yellow fill-vibrant-yellow" />
                          </div>
                          <div className="flex-1 h-2 bg-vibrant-black/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${star === 5 ? 75 : star === 4 ? 15 : star === 3 ? 7 : 3}%` }}
                              className="h-full bg-vibrant-yellow"
                            />
                          </div>
                          <span className="text-[8px] font-black opacity-30 w-6 text-right">{star === 5 ? '75%' : star === 4 ? '15%' : '5%'}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {[
                        { 
                          user: "Minh Anh", 
                          avatar: "MA",
                          rating: 5, 
                          comment: "Địa điểm tuyệt vời! Không gian cực kỳ ấn tượng và phục vụ rất chu đáo. Chắc chắn sẽ quay lại.",
                          date: "2 tuần trước"
                        },
                        { 
                          user: "Hoàng Long", 
                          avatar: "HL",
                          rating: 4, 
                          comment: "Trải nghiệm rất tốt, tuy nhiên hơi đông vào cuối tuần. Gợi ý nên đi vào ngày thường.",
                          date: "1 tháng trước"
                        }
                      ].map((review, idx) => (
                        <div key={idx} className="bg-white border-2 border-vibrant-black/10 p-5 rounded-2xl space-y-3 shadow-sm hover:border-vibrant-black/20 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-vibrant-orange flex items-center justify-center text-white text-xs font-black shadow-[3px_3px_0px_#1a1a1a]">
                                {review.avatar}
                              </div>
                              <div>
                                <p className="text-sm font-black text-vibrant-black mb-0.5">{review.user}</p>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-vibrant-yellow fill-vibrant-yellow' : 'text-vibrant-black/10'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[8px] font-black uppercase text-vibrant-black/30 tracking-widest">{review.date}</span>
                          </div>
                          <div className="flex gap-3">
                            <Quote className="w-4 h-4 text-vibrant-orange/30 shrink-0 mt-1" />
                            <p className="text-sm font-medium text-vibrant-black/70 italic leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-3 border-2 border-dashed border-vibrant-black/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-vibrant-black/40 hover:border-vibrant-orange hover:text-vibrant-orange hover:bg-vibrant-orange/5 transition-all">
                      Để lại đánh giá của bạn
                    </button>
                  </div>

                  <button 
                    className="w-full bg-vibrant-black text-white py-5 rounded-2xl font-black uppercase text-sm shadow-[8px_8px_0px_#FF6321] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 mt-4"
                    onClick={() => {
                      const query = encodeURIComponent(selectedLocation.name + ' ' + (selectedLocation.location || ''));
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    <MapPin className="w-5 h-5 text-vibrant-orange" />
                    Mở Trong Bản Đồ
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function DayBlock({ day, onSelect, isVND, displayCost }: { day: DayPlan, onSelect: (loc: any) => void, isVND: boolean, displayCost: (c: string) => string }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <span className="text-6xl font-display text-vibrant-black/10 select-none">0{day.day}</span>
        <h3 className="text-2xl font-black uppercase tracking-widest items-center flex gap-3">
          <div className="w-8 h-8 rounded-full bg-vibrant-orange flex items-center justify-center text-white text-xs shadow-[2px_2px_0px_#1a1a1a]">
            {day.day}
          </div>
          Hành trình Ngày {day.day}
        </h3>
      </div>

      <div className="space-y-10 relative pl-4 border-l-2 border-vibrant-black/5 ml-4">
        {day.activities.map((activity, idx) => (
          <div 
            key={activity.name} 
            onClick={() => onSelect(activity)}
            className="group relative cursor-pointer"
          >
            <div className="absolute -left-[27px] top-4 w-3 h-3 bg-white border-2 border-vibrant-black rounded-full group-hover:bg-vibrant-orange transition-colors" />
            
            <div className="flex gap-6">
              <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-vibrant-black shadow-[4px_4px_0px_#1a1a1a] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange/60">
                   {activity.visitTime} • {activity.duration}
                </p>
                <h4 className="text-xl font-bold leading-tight group-hover:text-vibrant-orange transition-colors">{activity.name}</h4>
                <p className="text-xs opacity-60 line-clamp-2 leading-tight">{activity.description}</p>
                <div className="pt-2 flex items-center gap-3">
                   <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase transition-colors ${isVND ? 'bg-vibrant-green text-white' : 'bg-vibrant-black text-white'}`}>
                     {displayCost(activity.cost)}
                   </span>
                   <span className="text-[10px] font-bold text-vibrant-black flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     Khám phá <ChevronLeft className="w-3 h-3 rotate-180" />
                   </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function OverviewStat({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[10px] uppercase font-semibold tracking-widest opacity-40">
        {icon} {label}
      </div>
      <div className="text-lg font-medium">{value}</div>
    </div>
  );
}

function DaySection({ day, index }: { day: DayPlan, index: number }) {
  return (
    <div className="relative">
      <div className="absolute -left-16 top-0 hidden lg:block">
        <h3 className="text-9xl font-serif italic text-white/5 select-none">{day.day.toString().padStart(2, '0')}</h3>
      </div>
      
      <div className="border-b border-white/10 pb-16">
        <div className="flex items-baseline gap-4 mb-12">
          <span className="text-viet-gold font-display text-4xl">DAY {day.day}</span>
          <span className="text-white/40 text-xl font-light">/ {day.date}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {day.activities.map((activity, aIdx) => (
             <ActivityCard key={activity.name} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="space-y-6 group"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
          {activity.type}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-2xl font-serif italic tracking-tight group-hover:text-viet-gold transition-colors">{activity.name}</h4>
        <p className="text-white/60 text-sm leading-relaxed">{activity.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest font-semibold pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 opacity-50"><Clock className="w-3 h-3" /> {activity.duration}</div>
          <div className="flex items-center gap-2 opacity-50"><DollarSign className="w-3 h-3" /> {activity.cost}</div>
          <div className="flex items-center gap-2 opacity-50"><MapPin className="w-3 h-3" /> {activity.visitTime}</div>
          <div className="flex items-center gap-2 opacity-100 text-viet-gold"><Lightbulb className="w-3 h-3" /> Tip Included</div>
        </div>

        <div className="bg-white/5 p-4 rounded-xl text-xs text-white/40 leading-relaxed border border-white/5">
          <span className="text-white/80 block mb-1 uppercase tracking-tighter font-bold">Pro Tip:</span>
          {activity.tips}
        </div>
      </div>
    </motion.div>
  );
}

function RecommendationCard({ item, compact }: { item: Recommendation, compact?: boolean }) {
  return (
    <div className="group space-y-4">
      <div className={`relative ${compact ? 'aspect-square' : 'aspect-video'} overflow-hidden rounded-3xl`}>
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-6">
           {item.priceRange && <div className="text-xs font-bold text-viet-gold uppercase mb-1">{item.priceRange}</div>}
           <h4 className="text-2xl font-display uppercase">{item.name}</h4>
        </div>
      </div>
      <div className="px-2 space-y-3">
        <p className="text-sm opacity-60 italic">{item.description}</p>
        {item.advantages && (
          <div className="flex gap-2 items-center text-[10px] uppercase font-bold tracking-widest text-viet-gold">
            <Sparkles className="w-3 h-3" /> {item.advantages}
          </div>
        )}
        {item.signatureDishes && (
          <div className="flex flex-wrap gap-2 pt-2">
            {item.signatureDishes.map(dish => (
              <span key={dish} className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono opacity-60">{dish}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon, variant = 'light' }: { title: string, subtitle: string, icon: React.ReactNode, variant?: 'light' | 'dark' }) {
  const colorClass = variant === 'dark' ? 'text-black' : 'text-white';
  const subColorClass = variant === 'dark' ? 'text-black/60' : 'text-white/60';

  return (
    <div className="container mx-auto px-6 mb-12">
      <div className="flex items-center gap-4 mb-4">
        {icon}
        <h2 className={`text-4xl font-display uppercase tracking-widest ${colorClass}`}>{title}</h2>
      </div>
      <p className={`text-xl font-light italic ${subColorClass}`}>{subtitle}</p>
    </div>
  );
}
