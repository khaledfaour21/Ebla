"use client";

import { simulatePromoteStudents } from "@/lib/actions"; // تأكد من صحة المسار

const SimulationButton = () => {
  const handleSimulateClick = async () => {
    alert("بدأت عملية التشغيل التجريبي...");
    const result = await simulatePromoteStudents();
    
    // عرض التقرير في رسالة alert كبيرة
    alert(result.message);
  };

  return (
    <button 
      onClick={handleSimulateClick}
      className="bg-blue-600 text-white font-bold p-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
    >
      تشغيل تجريبي (بدون حفظ)
    </button>
  );
};

export default SimulationButton;