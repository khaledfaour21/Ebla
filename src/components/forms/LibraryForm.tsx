"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { createLibrary, updateLibrary } from "@/lib/actions";
import InputField from "../InputField";
import { librarySchema, LibrarySchema } from "@/lib/formValidationSchemas";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LibraryForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any; // أضف هذا السطر
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LibrarySchema>({
    resolver: zodResolver(librarySchema),
    defaultValues: data || {},
  });

  const [img, setImg] = useState<any>(
    data?.image ? { secure_url: data.image } : null
  );

  const [state, formAction] = useFormState(
    type === "create" ? createLibrary : updateLibrary,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction({
      ...formData,
      image: img?.secure_url || "", // هنا الحل
      id: data?.id,
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`الكتاب تم ${type === "create" ? "إضافته" : "تعديله"} بنجاح!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, setOpen, type, router]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "إضافة كتاب جديد" : "تعديل بيانات الكتاب"}
      </h1>

      <InputField
        label="اسم الكتاب"
        name="title"
        register={register}
        error={errors.title}
        defaultValue={data?.title}
      />
      <InputField
        label="السنة الدراسية"
        name="grade"
        register={register}
        error={errors.grade}
        defaultValue={data?.grade}
      />
      <InputField
        label="رابط تحميل الكتاب من موقع الوزارة"
        name="link"
        register={register}
        error={errors.link}
        defaultValue={data?.link}
      />
      <InputField
        label="وصف الكتاب"
        name="description"
        register={register}
        error={errors.description}
        defaultValue={data?.description}
      />

      {/* تحميل صورة الكتاب */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">صورة الكتاب</label>
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>تحميل صورة</span>
            </div>
          )}
        </CldUploadWidget>

        {img && (
          <Image
            src={img.secure_url}
            alt="صورة الكتاب"
            width={100}
            height={100}
            className="mt-2 rounded-md"
          />
        )}

        {errors.image && (
          <p className="text-xs text-red-400">
            {errors.image.message?.toString()}
          </p>
        )}
      </div>

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "إضافة" : "تحديث"}
      </button>
    </form>
  );
};

export default LibraryForm;
