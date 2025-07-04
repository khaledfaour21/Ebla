"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { Dispatch, SetStateAction } from "react";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// تعريف نوع الصف
type SchoolClass = {
  id: number;
  name: string;
  capacity: number;
  _count: { students: number };
};

// سكيمة التحقق مع حقل التاريخ كـ string (للتوافق مع input type="datetime-local")
const announcementSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "العنوان مطلوب!" }),
  description: z.string().min(1, { message: "الوصف مطلوب !" }),
  date: z.string().min(1, { message: "التاريخ مطلوب !" }),
  classId: z
    .union([z.string().min(1), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
});

type AnnouncementInputs = z.infer<typeof announcementSchema>;

type AnnouncementFormProps = {
  type: "create" | "update";
  data?: Partial<AnnouncementInputs>;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  relatedData?: { classes: SchoolClass[] };
};

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: AnnouncementFormProps) => {
  const classes: SchoolClass[] = relatedData?.classes || [];
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementInputs>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      ...data,
      date: data?.date
        ? new Date(data.date).toISOString().substring(0, 16)
        : "",
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      ...formData,
      id: data?.id!, // تأكد أن id موجود هنا (علامة التعجب تخبر TypeScript أنه ليس undefined)
      date: new Date(formData.date), // تحويل التاريخ من string إلى Date
    };

    let result;
    if (type === "create") {
      result = await createAnnouncement(null, payload);
    } else {
      result = await updateAnnouncement(null, payload);
    }

    if (result?.success) {
      toast(`الإعلان تمّ ${type === "create" ? "إضافته" : "تعديله"}!`);
      if (setOpen) setOpen(false);
      router.refresh();
    } else {
      toast.error("حدث خطأ أثناء الإضافة!");
    }
  });

  return (
    <form
      className="flex flex-col gap-8"
      dir="rtl"
      onSubmit={onSubmit}
      noValidate
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "إضافة إعلان جديد" : "تعديل إعلان قديم"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="العنوان"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors.title}
        />
        <InputField
          label="الوصف"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors.description}
        />

        <InputField
          label="التاريخ"
          name="date"
          type="datetime-local"
          defaultValue={
            data?.date ? new Date(data.date).toISOString().substring(0, 16) : ""
          }
          register={register}
          error={errors.date}
        />

        {/* قائمة الصفوف المنسدلة */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">الصف</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">اختر الصف</option>
            {classes.map((classItem) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name} - {classItem?._count?.students ?? 0}/{" "}
                {classItem.capacity} السعة
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-xs text-red-400">
              {errors.classId.message?.toString()}
            </p>
          )}
        </div>
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "إضافة" : "تحديث"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
