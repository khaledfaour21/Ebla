"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { Dispatch, SetStateAction } from "react";
import { createEvent, updateEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type SchoolClass = {
  id: number;
  name: string;
  capacity: number;
  _count: { students: number };
};

const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  classId: z
    .union([z.string().min(1), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
});

type EventInputs = z.infer<typeof eventSchema>;

type EventFormProps = {
  type: "create" | "update";
  data?: Partial<EventInputs>;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  relatedData?: { classes: SchoolClass[] };
};

const EventForm = ({ type, data, setOpen, relatedData }: EventFormProps) => {
  const classes: SchoolClass[] = relatedData?.classes || [];
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventInputs>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime
        ? new Date(data.startTime).toISOString().substring(0, 16)
        : "",
      endTime: data?.endTime
        ? new Date(data.endTime).toISOString().substring(0, 16)
        : "",
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      ...formData,
      id: data?.id,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    };

    let result;
    if (type === "create") {
      result = await createEvent(null, payload);
    } else {
      result = await updateEvent(null, payload);
    }

    if (result?.success) {
      toast(`الحدث تمّ ${type === "create" ? "إضافته" : "تعديله"}!`);
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
        {type === "create" ? "إضافة حدث جديد" : "تعديل حدث قديم"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="عنوان الحدث"
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
          label="تاريخ ووقت البداية"
          name="startTime"
          type="datetime-local"
          defaultValue={
            data?.startTime
              ? new Date(data.startTime).toISOString().substring(0, 16)
              : ""
          }
          register={register}
          error={errors.startTime}
        />
        <InputField
          label="تاريخ ووقت النهاية"
          name="endTime"
          type="datetime-local"
          defaultValue={
            data?.endTime
              ? new Date(data.endTime).toISOString().substring(0, 16)
              : ""
          }
          register={register}
          error={errors.endTime}
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
                {classItem.name} - {classItem?._count?.students ?? 0}/
                {classItem.capacity} السعة{" "}
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

export default EventForm;
