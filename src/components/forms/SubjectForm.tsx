"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
  };
}) => {
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      maxMark: data?.maxMark || 100,
      teachers: data?.teachers?.map((t: { id: string }) => t.id) || [],
    },
  });

  const router = useRouter();

  const onSubmit = async (formData: SubjectSchema) => {
    setIsSubmitting(true);
    setServerError("");

    let result;

    if (type === "create") {
      result = await createSubject({ success: false, error: false }, formData);
    } else {
      // --- THIS IS THE FIX ---
      // We explicitly create the object to be updated
      // and ensure the ID from the original data is included.
      const dataToUpdate = {
        ...formData,
        id: data.id, 
      };

      if (!dataToUpdate.id) {
        setServerError("ID المادة مفقود، لا يمكن التحديث.");
        setIsSubmitting(false);
        return;
      }
      
      result = await updateSubject({ success: false, error: false }, dataToUpdate);
      // --- END OF FIX ---
    }

    if (result.success) {
      toast.success(`المادة تمّ ${type === "create" ? "إنشاؤها" : "تعديلها"} بنجاح!`);
      setOpen(false);
      router.refresh();
    } else {
      setServerError(result.message || "حدث خطأ ما.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" dir="rtl">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "اضافة مادة جديدة" : "تعديل المادة"}
      </h1>
      
      {/* We keep the hidden input to help react-hook-form, but the logic above is the main fix */}
      {data?.id && <input type="hidden" {...register("id")} />}
      
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="اسم المادة" name="name" register={register} error={errors?.name} />
        <InputField label="العلامة العظمى" name="maxMark" type="number" register={register} error={errors?.maxMark} />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-medium">المدرسون</label>
        <select multiple className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-32" {...register("teachers")}>
          {relatedData?.teachers?.map((teacher) => (
            <option value={teacher.id} key={teacher.id}>{teacher.name} {teacher.surname}</option>
          ))}
        </select>
        {errors.teachers && (<p className="text-xs text-red-400">{errors.teachers.message}</p>)}
      </div>
      
      {serverError && <span className="text-red-500 text-sm">{serverError}</span>}

      <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400">
        {isSubmitting ? "جاري الحفظ..." : (type === "create" ? "إضافة" : "حفظ التعديلات")}
      </button>
    </form>
  );
};

export default SubjectForm;