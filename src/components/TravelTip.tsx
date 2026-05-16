import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, RefreshCw, X } from 'lucide-react';
import { Language, translations } from '../lib/translations';

interface TravelTipProps {
  language: Language;
}

export default function TravelTip({ language }: TravelTipProps) {
  const tips = useMemo(() => language === 'vi' 
    ? [
        "Luôn mang theo bản sao hộ chiếu và bảo hiểm du lịch trong email.",
        "Học một vài câu giao tiếp bản địa cơ bản sẽ giúp chuyến đi thú vị hơn rất nhiều.",
        "Sử dụng thẻ Revolut hoặc Wise để tránh phí chuyển đổi ngoại tệ khi thanh toán.",
        "Đóng gói quần áo theo dạng cuộn để tiết kiệm không gian và giảm nếp nhăn.",
        "Luôn mang theo sạc dự phòng, đặc biệt là khi sử dụng bản đồ liên tục.",
        "Tải bản đồ ngoại tuyến của Google Maps trước khi bắt đầu hành trình.",
        "Đừng quên mang theo bình nước cá nhân để giảm rác thải nhựa.",
        "Ăn tại những nơi có đông người địa phương thường là sự lựa chọn an toàn và ngon nhất.",
        "Chụp ảnh vị trí đỗ xe hoặc trạm tàu để không bị lạc khi quay lại.",
        "Sử dụng túi hút chân không cho quần áo mùa đông để tối ưu diện tích vali."
      ]
    : [
        "Always keep a digital copy of your passport and travel insurance in your email.",
        "Learning a few local phrases makes a world of difference in your interactions.",
        "Use cards like Revolut or Wise to save on currency conversion fees.",
        "Roll your clothes instead of folding to save space and reduce wrinkles.",
        "Always carry a power bank, especially when relying on GPS all day.",
        "Download offline areas in Google Maps before you head out.",
        "Bring a reusable water bottle to reduce plastic waste and stay hydrated.",
        "Eat where the locals eat – it's usually safer, cheaper, and much tastier.",
        "Snapshot your parking spot or nearest station to avoid getting lost.",
        "Use compression bags for bulky winter gear to maximize suitcase space."
      ], [language]);

  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const rotateTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  useEffect(() => {
    const interval = setInterval(rotateTip, 10000);
    return () => clearInterval(interval);
  }, [tips.length]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-16 p-8 bg-white border-4 border-vibrant-black rounded-[2rem] shadow-[8px_8px_0px_#FFD700] relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 flex gap-2">
        <button 
          onClick={rotateTip}
          className="p-2 hover:bg-vibrant-cream rounded-full transition-colors text-vibrant-black/40 hover:text-vibrant-black"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 hover:bg-vibrant-cream rounded-full transition-colors text-vibrant-black/40 hover:text-vibrant-black"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-6">
        <div className="bg-vibrant-yellow p-4 rounded-2xl border-2 border-vibrant-black flex-shrink-0">
          <Lightbulb className="w-8 h-8 text-vibrant-black" />
        </div>
        <div className="space-y-4 pr-12">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-vibrant-orange">
            {language === 'vi' ? 'Mẹo Du Hành Nomad' : 'Nomad Travel Tip'}
          </h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTip}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-xl font-bold leading-relaxed text-vibrant-black italic"
            >
              "{tips[currentTip]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative pulse */}
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-vibrant-yellow/10 rounded-full blur-2xl group-hover:bg-vibrant-yellow/20 transition-all" />
    </motion.div>
  );
}
