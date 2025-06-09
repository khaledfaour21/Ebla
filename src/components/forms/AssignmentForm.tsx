"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import {
  createAssignment,
  
  updateAssignment,
} from "@/lib/actions";
import { useActionState } from "react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useActionState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

//   const onSubmit = handleSubmit((formData) => {
//     const payload = {
//       title: formData.title,
//       lessonId: Number(formData.lessonId),
//       startTime: new Date(formData.startDate), // تحويل startDate إلى startTime
//       endTime: new Date(formData.dueDate),     // تحويل dueDate إلى endTime
//       ...(formData.id && { id: formData.id }),
//     };
//     formAction(payload);
//   });
  
  const onSubmit = handleSubmit((formData) => {
    const payload = {
      id: formData.id,
      title: formData.title,
      lessonId: Number(formData.lessonId),
      startDate: new Date(formData.startDate),
      dueDate: new Date(formData.dueDate),
    };
    formAction(payload);
  });
  

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `الواجب تمّ ${type === "create" ? "إضافته" : "تعديله"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "اضافة واجب جديد" : "تعديل واجب قديم"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="عنوان الواجب"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="تاريخ ووقت البداية"
          name="startDate"
          defaultValue={data?.startDate}
          register={register}
          error={errors?.startDate}
          type="datetime-local"
        />
        <InputField
          label="تاريخ ووقت النهاية"
          name="dueDate"
          defaultValue={data?.dueDate}
          register={register}
          error={errors?.dueDate}
          type="datetime-local"
        />
        {data && (
          <InputField
            label="الرقم"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.teachers}
          >
            {lessons.map((lesson: { id: number; name: string }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">حدث خطأ !</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "إضافة" : "تحديث"}
      </button>
    </form>
  );
};

export default AssignmentForm;
