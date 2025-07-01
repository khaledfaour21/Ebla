// في components/PasswordConfirmModal.tsx
"use client";

import { useState } from "react";

type PasswordConfirmModalProps = {
  onConfirm: (password: string) => void;
  onClose: () => void;
  isLoading: boolean;
};

const PasswordConfirmModal = ({ onConfirm, onClose, isLoading }: PasswordConfirmModalProps) => {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    if (password) {
      onConfirm(password);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-gray-800">تأكيد العملية</h2>
        <p className="text-sm text-gray-600 mb-4">
          لتأكيد هذه العملية الحساسة، الرجاء إدخال كلمة المرور الخاصة بك.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          placeholder="كلمة المرور"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "الرجاء الانتظار..." : "تأكيد والبدء"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;