"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { Dispatch, SetStateAction } from "react";

const eventSchema = z.object({
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
  relatedData?: any;
};

const EventForm = ({ type, data, setOpen, relatedData }: EventFormProps) => {
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

  const onSubmit = handleSubmit((formData) => {
    const payload = {
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    };

    console.log(payload);
    // إرسال البيانات إلى الـ API أو المعالجة المطلوبة

    if (setOpen) setOpen(false);
  });

  return (
    <form
      className="flex flex-col gap-8"
      dir="ltr"
      onSubmit={onSubmit}
      noValidate
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update event"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors.title}
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors.description}
        />
        <InputField
          label="Start Time"
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
          label="End Time"
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
        <InputField
          label="Class ID"
          name="classId"
          type="number"
          defaultValue={data?.classId?.toString() || ""}
          register={register}
          error={errors.classId}
        />
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventForm;