import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, Wallet, Sparkles, Send, Loader2, Compass, Wind } from 'lucide-react';
import { translations, Language } from '../lib/translations';

interface TravelFormProps {
  onGenerate: (data: {
    destination: string;
    duration: number;
    budget: string;
    travelStyle: string;
    interests: string[];
    dietaryPreferences?: string[];
    preferredCuisines?: string[];
    preferredAirlines?: string;
    preferredFlightTime?: string;
  }) => void;
  isLoading: boolean;
  language: Language;
  isOffline?: boolean;
}

export default function TravelForm({ onGenerate, isLoading, language, isOffline }: TravelFormProps) {
  const t = useMemo(() => translations[language], [language]);

  const STYLES = language === 'vi' 
    ? ["Du mục / Địa phương", "Sang trọng / Thẩm mỹ", "Thư giãn / Thực thần", "Viên ngọc ẩn", "Văn hóa / Lịch sử"]
    : ["Nomadic / Local", "Luxury / Aesthetic", "Relaxing / Foodie", "Hidden Gems", "Culture / History"];

  const INTERESTS = language === 'vi'
    ? ["Cà phê đặc sản", "Quán Bar Cocktail", "Ẩm thực đường phố", "Nhiếp ảnh", "Bãi biển", "Leo núi", "Kiến trúc Brutalist", "Địa điểm TikTok", "Chèo Kayak", "Chợ đêm", "Bảo tàng & Di tích", "Gốm sứ & Thủ công", "Workshop nghệ thuật", "Thiền & Yoga", "Cuộc sống về đêm", "Mua sắm local brand", "Lớp học nấu ăn"]
    : ["Specialty Coffee", "Cocktail Bars", "Street Food", "Photography", "Beaches", "Hiking", "Brutalist Architecture", "TikTok Spots", "Kayaking", "Night Markets", "Museums & Heritage", "Pottery & Crafts", "Art Workshops", "Meditation & Yoga", "Vibrant Nightlife", "Local Brand Shopping", "Cooking Classes"];

  const DIETARY_LABELS = {
    [t.dietaryAll]: "Tất cả",
    [t.dietaryVegetarian]: "Chay (Vegetarian)",
    [t.dietaryVegan]: "Thuần chay (Vegan)",
    [t.dietaryGlutenFree]: "Không Gluten"
  };

  const DIETARY_OPTIONS = [t.dietaryAll, t.dietaryVegetarian, t.dietaryVegan, t.dietaryGlutenFree];
  const CUISINES = language === 'vi'
    ? ["Truyền thống", "Hiện đại", "Á Đông", "Âu Mỹ", "Hải sản", "Fine Dining"]
    : ["Traditional", "Modern", "Asian", "Western", "Seafood", "Fine Dining"];

  const [destination, setDestination] = useState(language === 'vi' ? "Đà Lạt, Việt Nam" : "Da Lat, Vietnam");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(t.budgetModerate);
  const [preferredAirlines, setPreferredAirlines] = useState("");
  const [preferredFlightTime, setPreferredFlightTime] = useState("Linh hoạt");
  const [travelStyle, setTravelStyle] = useState(STYLES[1]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(INTERESTS.slice(2, 4));
  const [dietary, setDietary] = useState<string[]>([t.dietaryAll]);
  const [cuisines, setCuisines] = useState<string[]>([CUISINES[0]]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (destination && destination.length > 2 && showSuggestions) {
        fetchSuggestions(destination);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [destination]);

  const fetchSuggestions = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=${language}`);
      const data = await response.json();
      const results = data.map((item: any) => item.display_name);
      setSuggestions(results);
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (d: string) => {
    setDestination(d);
    setShowSuggestions(false);
  };

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ 
      destination, 
      duration, 
      budget, 
      travelStyle, 
      interests: selectedInterests,
      dietaryPreferences: dietary,
      preferredCuisines: cuisines,
      preferredAirlines,
      preferredFlightTime
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-12 rounded-[2.5rem] border-4 border-vibrant-black bg-white shadow-[12px_12px_0px_#FF6321]"
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-vibrant-orange p-3 rounded-2xl shadow-[4px_4px_0px_#1a1a1a]">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-4xl font-display uppercase tracking-widest text-vibrant-black">{t.formTitle}</h2>
          <p className="text-[10px] font-black uppercase text-vibrant-orange italic flex items-center gap-1 mt-1">
            <Compass className="w-3 h-3" /> {t.formSubtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-3 relative">
            <div className="flex items-center justify-between">
              <label className="text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <MapPin className="w-4 h-4 text-vibrant-orange" /> {t.searchDestination}
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t.destinationPlaceholder}
                className="w-full bg-vibrant-cream border-2 border-vibrant-black rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:ring-4 focus:ring-vibrant-orange/20 transition-all font-bold"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-vibrant-orange" />
                </div>
              )}
              <AnimatePresence>
                {showSuggestions && destination.length > 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-white border-2 border-vibrant-black rounded-2xl shadow-[8px_8px_0px_#1a1a1a] overflow-hidden"
                  >
                    {suggestions.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto no-scrollbar">
                        {suggestions.map((d, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(d)}
                            className="w-full text-left px-5 py-3 hover:bg-vibrant-yellow font-bold border-b border-vibrant-black/10 last:border-0 transition-colors flex items-center gap-3"
                          >
                            <MapPin className="w-4 h-4 text-vibrant-orange shrink-0" />
                            <span className="truncate text-sm">{d}</span>
                          </button>
                        ))}
                      </div>
                    ) : !isSearching && (
                      <div className="px-5 py-3 text-sm font-black text-vibrant-black/40 italic">
                        {language === 'vi' ? 'Không tìm thấy kết quả.' : 'No results found.'}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {showSuggestions && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowSuggestions(false)} 
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
              <Calendar className="w-4 h-4 text-vibrant-orange" /> {t.duration}
            </label>
            <input
              type="range"
              min="1"
              max="14"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-3 bg-vibrant-cream rounded-lg appearance-none cursor-pointer accent-vibrant-orange border-2 border-vibrant-black"
            />
            <div className="flex justify-between text-sm font-black">
              <span className="opacity-40">1 {t.daysSuffix}</span>
              <span className="text-vibrant-orange text-xl bg-vibrant-orange/10 px-3 py-1 rounded-lg border-2 border-vibrant-orange">{duration} {t.daysSuffix}</span>
              <span className="opacity-40">14 {t.daysSuffix}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
              <Wallet className="w-4 h-4 text-vibrant-orange" /> {t.budget}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[t.budgetBudget, t.budgetModerate, t.budgetLuxury].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                    budget === b 
                      ? 'border-vibrant-black bg-vibrant-yellow text-vibrant-black shadow-[4px_4px_0px_#1a1a1a]' 
                      : 'border-vibrant-black/10 bg-vibrant-cream hover:border-vibrant-black/30'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-vibrant-orange" /> {t.travelStyle}
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTravelStyle(s)}
                  className={`px-5 py-3 rounded-full border-2 text-sm font-bold transition-all ${
                    travelStyle === s 
                      ? 'border-vibrant-black bg-vibrant-orange text-white shadow-[4px_4px_0px_#1a1a1a]' 
                      : 'border-vibrant-black/10 bg-vibrant-cream hover:border-vibrant-black/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black">{t.interests}</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleItem(selectedInterests, setSelectedInterests, i)}
                  className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    selectedInterests.includes(i) 
                      ? 'border-vibrant-black bg-vibrant-green text-white shadow-[4px_4px_0px_#1a1a1a]' 
                      : 'border-vibrant-black/10 bg-vibrant-cream hover:border-vibrant-black/30'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-vibrant-black/5">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black">{t.dietary}</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleItem(dietary, setDietary, d)}
                  className={`px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all ${
                    dietary.includes(d) 
                      ? 'border-vibrant-black bg-vibrant-orange text-white shadow-[3px_3px_0px_#1a1a1a]' 
                      : 'border-vibrant-black/10 bg-vibrant-cream hover:border-vibrant-black/30'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black">{t.preferredCuisines}</label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleItem(cuisines, setCuisines, c)}
                  className={`px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all ${
                    cuisines.includes(c) 
                      ? 'border-vibrant-black bg-vibrant-yellow text-vibrant-black shadow-[3px_3px_0px_#1a1a1a]' 
                      : 'border-vibrant-black/10 bg-vibrant-cream hover:border-vibrant-black/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="md:col-span-2 pt-6">
          <button
            type="submit"
            disabled={isLoading || isOffline}
            className="w-full bg-vibrant-black text-white font-display text-2xl uppercase py-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-vibrant-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[8px_8px_0px_#FFD700]"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin border-4 border-white/20 border-t-white rounded-full w-6 h-6" /> {t.syncing}
              </span>
            ) : isOffline ? (
              <span className="flex items-center gap-3 opacity-60">
                <Wind className="w-6 h-6" /> {t.offlineMode}
              </span>
            ) : (
              <>
                {t.generateButton} <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
