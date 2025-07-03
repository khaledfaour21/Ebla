import { AIChat } from "@/components/AIChat";
import Image from "next/image";

const AIHelperPage = () => {
  return (
    // Main container with a soft, animated gradient background
    <div className="w-full min-h-full p-4 md:p-8 flex items-center justify-center 
                    from-sky-50 via-blue-50 to-purple-50 animate-gradient-move" dir="rtl">
      
      {/* Wrapper for content with a fade-in animation */}
      <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
        
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo with a fancy hover effect */}
          <Image
            src="/robot.png"
            alt="المساعد الذكي"
            width={80}
            height={80}
            className="mb-4 transition-all duration-300 ease-in-out hover:scale-110 hover:drop-shadow-xl hover:rotate-[12deg]"
          />
          
          {/* Title with a gradient text effect */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text pb-2">
            مساعد مدرسة إيبلا الذكي
          </h1>

          <p className="text-lg text-slate-500 mt-2">
            صُمم خصيصاً لخدمتك. اطرح سؤالاً، اطلب تحليلاً، أو استكشف إمكانيات جديدة.
          </p>
        </div>
        
        <AIChat />
        
      </div>
    </div>
  );
};

export default AIHelperPage;