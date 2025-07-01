"use client";

import { deleteItem } from "@/lib/actions"; // استدعاء الدالة الجديدة
import Image from "next/image";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const DeleteForm = ({ id, table }: { id?: string | number, table: string }) => {
  // الحالة الأولية الآن صحيحة وتتضمن رسالة
  const [state, formAction] = useFormState(deleteItem, { 
    success: false, 
    error: false, 
    message: "" 
  });
  
  const router = useRouter();

  // هذا الكود مسؤول عن إظهار إشعار Toast
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "تم الحذف بنجاح!");
      router.refresh(); // لتحديث القائمة بعد الحذف
    }
    if (state.error && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // رسالة التأكيد قبل الحذف
    if (!window.confirm("هل أنت متأكد من أنك تريد حذف هذا العنصر؟ العملية لا يمكن التراجع عنها.")) {
      e.preventDefault();
    }
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="table" value={table} />
      <button
        type="submit"
        onClick={handleDeleteClick}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-Purple hover:bg-Purple transition-colors"
        title="حذف"
      >
        <Image src="/delete.png" alt="حذف" width={16} height={16} />
      </button>
    </form>
  );
};

export default DeleteForm;