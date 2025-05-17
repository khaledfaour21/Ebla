"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import InputField from "../InputField"
import { Dispatch, SetStateAction, useEffect } from "react"
import { ResultSchema, resultSchema } from "@/lib/formValidationSchemas"
import { useFormState } from "react-dom"
import { createResult, updateResult } from "@/lib/actions"
import { toast } from "react-toastify"

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update"
  data?: any
  setOpen: Dispatch<SetStateAction<boolean>>
  relatedData?: any
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data || {},
  })

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  )

  const onSubmit = handleSubmit((formData) => {
    formAction(formData)
  })

  useEffect(() => {
    if (state.success) {
      toast('Result has been ${type === "create" ? "created" : "updated"}!')
      setOpen(false)
    }
  }, [state, setOpen, type])

  const { students, lessons } = relatedData

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "إضافة علامة جديدة" : "تعديل العلامة"}
      </h1>

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">الطالب</label>
          <select
            {...register("studentId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            {students.map((s: any) => (
              <option value={s.id} key={s.id}>
                {s.name} {s.surname}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">الدرس</label>
          <select
            {...register("lessonId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            {lessons.map((l: any) => (
              <option value={l.id} key={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">الفصل</label>
          <select
            {...register("term")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="FIRST">الفصل الأول</option>
            <option value="SECOND">الفصل الثاني</option>
          </select>
        </div>
      </div>

      {/* العلامات */}
      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="علامة مذاكرة أولى"
          name="quiz1"
          register={register}
          error={errors.quiz1}
          type="text"
        />
        <InputField
          label="علامة مذاكرة ثانية"
          name="quiz2"
          register={register}
          error={errors.quiz2}
          type="text"
        />
        <InputField
          label="علامة الشفهي"
          name="oral"
          register={register}
          error={errors.oral}
          type="text"
        />
        <InputField
          label="علامة الوظائف"
          name="homework"
          register={register}
          error={errors.homework}
          type="text"
        />
        <InputField
          label="علامة الفحص النهائي"
          name="final"
          register={register}
          error={errors.final}
          type="text"
        />
        <InputField
          label="المجموع النهائي"
          name="total"
          register={register}
          error={errors.total}
          type="text"
        />
      </div>

      <InputField
        label="ملاحظات"
        name="note"
        register={register}
        error={errors.note}
      />

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "إضافة" : "تحديث"}
      </button>
    </form>
  )
}

export default ResultForm