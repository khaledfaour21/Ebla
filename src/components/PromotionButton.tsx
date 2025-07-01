// في components/PromotionButton.tsx
"use client";

import { useState } from "react";
import PasswordConfirmModal from "./PasswordConfirmModal";
import { verifyPasswordAndPromoteStudents } from "@/lib/actions"; // <-- دالة جديدة سننشئها

const PromotionButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async (password: string) => {
    setIsLoading(true);
    const result = await verifyPasswordAndPromoteStudents(password);
    
    if (result.success) {
      alert(result.message || "تمت عملية الترفيع بنجاح!");
      window.location.reload();
    } else {
      alert(`فشل التحقق: ${result.message || "كلمة المرور غير صحيحة."}`);
    }
    
    setIsLoading(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-red-600 text-white font-bold p-4 rounded-lg hover:bg-red-800 transition-colors shadow-lg"
      >
        بدء عملية ترفيع نهاية العام
      </button>

      {isModalOpen && (
        <PasswordConfirmModal
          isLoading={isLoading}
          onConfirm={handleConfirm}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default PromotionButton;