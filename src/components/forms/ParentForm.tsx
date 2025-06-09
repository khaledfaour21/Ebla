"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import {  ParentSchema } from "@/lib/formValidationSchemas";
import { useActionState } from "react";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";





const ParentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: ParentSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(ParentSchema),
    defaultValues: data || {},
  });

  const [state, formAction] = useActionState(
    type === "create" ? createParent : updateParent,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`ولي الأمر تمّ ${type === "create" ? "إضافته" : "تعديله"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "انشاء ولي أمر " : "تعديل ولي الأمر"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
       معلومات المصادقة
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="اسم المستخدم"
          name="username"
          register={register}
          error={errors.username}
          defaultValue={data?.username}
        />
        <InputField
          label="البريد الإلكتروني"
          name="email"
          register={register}
          error={errors.email}
          defaultValue={data?.email}
        />
        <InputField
          label="كلمة المرور"
          name="password"
          type="password"
          register={register}
          error={errors.password}
          defaultValue={data?.password}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        المعلومات الشخصية
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="الاسم الأول"
          name="name"
          register={register}
          error={errors.name}
          defaultValue={data?.name}
        />
        <InputField
          label="الاسم الأخير"
          name="surname"
          register={register}
          error={errors.surname}
          defaultValue={data?.surname}
        />
        <InputField
          label="رقم الهاتف"
          name="phone"
          register={register}
          error={errors.phone}
          defaultValue={data?.phone}
        />
        <InputField
          label="العنوان"
          name="address"
          register={register}
          error={errors.address}
          defaultValue={data?.address}
        />
      </div>

      {data && (
        <InputField
          label="الرقم"
          name="id"
          register={register}
          error={errors.id}
          defaultValue={data?.id}
          hidden
        />
      )}

      {state.error && (
        <span className="text-red-500">حدث خطأ !</span>
      )}

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "إضافة" : "تحديث"}
      </button>
    </form>
  );
};

export default ParentForm;
