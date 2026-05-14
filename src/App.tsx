import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateItinerary } from './services/gemini';
import { TravelItinerary } from './types';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import ChatAssistant from './components/ChatAssistant';
import { Sparkles, MapPin, Wind, History, Upload } from 'lucide-react';

export default function App() {
  const [itinerary, setItinerary] = useState<TravelItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const heroImages = [
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1555681938-3497e70498a4?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=2000"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    
    // Check for saved itinerary
    const saved = localStorage.getItem('saved_itinerary');
    if (saved) setHasSaved(true);
    
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleLoadSaved = () => {
    const saved = localStorage.getItem('saved_itinerary');
    if (saved) {
      try {
        setItinerary(JSON.parse(saved));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification("Lịch trình đã lưu đã được tải!");
      } catch (e) {
        console.error("Failed to parse saved itinerary", e);
        localStorage.removeItem('saved_itinerary');
        setHasSaved(false);
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          // Simple validation check
          if (importedData.overview && importedData.days) {
            setItinerary(importedData);
            localStorage.setItem('saved_itinerary', content);
            setHasSaved(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification("Nhập lịch trình thành công!");
          } else {
            setError("Tệp tin không đúng định dạng lịch trình.");
          }
        } catch (err) {
          console.error("Failed to import itinerary", err);
          setError("Lỗi khi đọc tệp tin.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async (formData: {
    destination: string;
    duration: number;
    budget: string;
    travelStyle: string;
    interests: string[];
    dietaryPreferences?: string[];
    preferredCuisines?: string[];
    preferredAirlines?: string;
    preferredFlightTime?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await generateItinerary(
        formData.destination,
        formData.duration,
        formData.budget,
        formData.travelStyle,
        formData.interests,
        formData.dietaryPreferences,
        formData.preferredCuisines,
        formData.preferredAirlines,
        formData.preferredFlightTime
      );
      setItinerary(data);
      localStorage.setItem('saved_itinerary', JSON.stringify(data));
      setHasSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showNotification("Lịch trình mới đã sẵn sàng!");
    } catch (err) {
      console.error(err);
      setError("Đồng bộ hóa thất bại. Vui lòng thử một điểm đến khác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-vibrant-cream text-vibrant-black selection:bg-vibrant-yellow selection:text-vibrant-black">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 24, x: '-50%', opacity: 1 }}
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            className="fixed top-0 left-1/2 z-[3000] px-6 py-3 bg-vibrant-black text-white border-2 border-white/20 rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,0.2)] flex items-center gap-3 backdrop-blur-md"
          >
            <div className="p-1.5 bg-vibrant-green rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!itinerary ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
            
            {/* Landing Hero */}
            <header className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden p-6 bg-vibrant-black">
               {/* Dynamic Background */}
               <div className="absolute inset-0 z-0">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 0.6, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-b from-vibrant-black/60 via-transparent to-vibrant-cream z-10" />
                  <div className="absolute inset-0 opacity-20 z-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:32px_32px]" />
                  </div>
               </div>

               <div className="relative z-30 space-y-8 max-w-5xl">
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="bg-vibrant-yellow border-4 border-vibrant-black px-8 py-2 rounded-full inline-flex items-center gap-4 text-vibrant-black shadow-[4px_4px_0px_#1a1a1a] mb-6"
                 >
                   <MapPin className="w-5 h-5" />
                   <span className="text-sm uppercase tracking-[0.4em] font-black italic">Hà Nội • Đà Nẵng • Sài Gòn</span>
                   <Wind className="w-5 h-5" />
                 </motion.div>

                 <motion.h1 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-[14vw] sm:text-[12vw] leading-[0.8] font-display uppercase tracking-tight text-white drop-shadow-[8px_8px_0px_#1a1a1a]"
                 >
                   NOMADMAP <span className="text-vibrant-orange italic">AI</span>
                 </motion.h1>

                 <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl font-black uppercase text-white/60 tracking-tighter"
                 >
                   Làn sóng mới của <span className="text-white">Khám Phá Toàn Cầu</span>
                 </motion.p>
                 
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="pt-16 flex flex-col items-center gap-6"
                 >
                   <div className="flex flex-wrap items-center justify-center gap-4">
                     {hasSaved && (
                       <motion.button
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={handleLoadSaved}
                         className="group relative px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-colors hover:bg-white/20"
                       >
                         <History className="w-4 h-4 text-vibrant-orange" />
                         Tải Lịch Trình Đã Lưu
                       </motion.button>
                     )}
                     <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={handleImportClick}
                       className="group relative px-6 py-3 bg-vibrant-yellow border-2 border-vibrant-black rounded-xl text-vibrant-black font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-[4px_4px_0px_#1a1a1a] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                     >
                       <Upload className="w-4 h-4" />
                       Nhập Lịch Trình (.JSON)
                     </motion.button>
                   </div>

                   <div className="animate-bounce flex flex-col items-center gap-4">
                     <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white">Cuộn để bắt đầu</span>
                     <div className="p-3 border-2 border-white rounded-full bg-vibrant-black/40 backdrop-blur-sm">
                       <Sparkles className="w-6 h-6 text-vibrant-orange" />
                     </div>
                   </div>
                 </motion.div>
               </div>
            </header>

            <section className="py-32 px-6">
               <TravelForm onGenerate={handleGenerate} isLoading={loading} />
               {error && (
                 <div className="max-w-md mx-auto mt-12 bg-vibrant-black text-white p-6 rounded-2xl border-4 border-vibrant-orange shadow-[8px_8px_0px_#FF6321] text-center">
                   <p className="font-display text-xl uppercase italic">Lỗi Đồng Bộ</p>
                   <p className="text-xs opacity-60 mt-2 font-mono uppercase tracking-widest">{error}</p>
                 </div>
               )}
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="itinerary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ItineraryDisplay 
              itinerary={itinerary} 
              onBack={() => setItinerary(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-vibrant-yellow flex flex-col items-center justify-center p-12 text-center overflow-hidden">
           {/* Background Grid Accent */}
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,_black,_black_20px,_transparent_20px,_transparent_40px)]" />
           </div>

           <div className="relative z-10">
             <div className="relative w-32 h-32 mb-12 mx-auto">
                <div className="absolute inset-0 border-8 border-vibrant-black rounded-full" />
                <div className="absolute inset-0 border-t-8 border-vibrant-orange rounded-full animate-spin" />
                <div className="absolute inset-0 m-auto w-16 h-16 bg-white border-4 border-vibrant-black rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-vibrant-orange animate-pulse" />
                </div>
             </div>
             
             <h2 className="text-6xl font-display uppercase tracking-widest mb-6 text-vibrant-black">Đang Đồng Bộ...</h2>
             <div className="max-w-md space-y-6 mx-auto">
                <p className="text-vibrant-black font-black uppercase text-xs tracking-widest bg-white border-2 border-vibrant-black px-4 py-2 rounded-lg">Khai thác các viên ngọc ẩn</p>
                <p className="text-vibrant-black font-black uppercase text-xs tracking-widest bg-white border-2 border-vibrant-black px-4 py-2 rounded-lg">Tối ưu hóa các tuyến đường điện ảnh</p>
             </div>
           </div>
        </div>
      )}
      <ChatAssistant />
    </main>
  );
}
