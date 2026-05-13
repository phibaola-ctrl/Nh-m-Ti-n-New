import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Wallet, Sparkles, Send } from 'lucide-react';

interface TravelFormProps {
  onGenerate: (data: {
    destination: string;
    duration: number;
    budget: string;
    travelStyle: string;
    interests: string[];
  }) => void;
  isLoading: boolean;
}

const STYLES = ["Du mục / Địa phương", "Sang trọng / Thẩm mỹ", "Thư giãn / Thực thần", "Viên ngọc ẩn", "Văn hóa / Lịch sử"];
const INTERESTS = ["Cà phê đặc sản", "Quán Bar Cocktail", "Ẩm thực đường phố", "Nhiếp ảnh", "Bãi biển", "Leo núi", "Kiến trúc Brutalist", "Địa điểm TikTok"];

export default function TravelForm({ onGenerate, isLoading }: TravelFormProps) {
  const [destination, setDestination] = useState("Đà Lạt, Việt Nam");
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState("Vừa phải");
  const [travelStyle, setTravelStyle] = useState(STYLES[1]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Street Food", "Photography"]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ destination, duration, budget, travelStyle, interests: selectedInterests });
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
        <h2 className="text-4xl font-display uppercase tracking-widest text-vibrant-black">Lên Kế Hoạch</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
              <MapPin className="w-4 h-4 text-vibrant-orange" /> Điểm đến
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="v.d. Kyoto, Nhật Bản"
              className="w-full bg-vibrant-cream border-2 border-vibrant-black rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-vibrant-orange/20 transition-all font-bold"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
              <Calendar className="w-4 h-4 text-vibrant-orange" /> Thời gian
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
              <span className="opacity-40">1 Ngày</span>
              <span className="text-vibrant-orange text-xl bg-vibrant-orange/10 px-3 py-1 rounded-lg border-2 border-vibrant-orange">{duration} Ngày</span>
              <span className="opacity-40">14 Ngày</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-2">
              <Wallet className="w-4 h-4 text-vibrant-orange" /> Ngân sách
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Tiết kiệm", "Vừa phải", "Sang trọng"].map(b => (
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
              <Sparkles className="w-4 h-4 text-vibrant-orange" /> Phong cách
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
            <label className="text-[12px] uppercase tracking-[0.3em] font-black">Sở thích</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInterest(i)}
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
        </div>

        <div className="md:col-span-2 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-vibrant-black text-white font-display text-2xl uppercase py-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-vibrant-orange transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[8px_8px_0px_#FFD700]"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin border-4 border-white/20 border-t-white rounded-full w-6 h-6" /> Đang đồng bộ hóa...
              </span>
            ) : (
              <>
                Tạo Lịch Trình <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
