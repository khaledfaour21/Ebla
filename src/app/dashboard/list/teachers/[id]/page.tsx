import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth, getAuth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!teacher) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/*right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md text-right" dir="rtl">
          <h1 className="text-xl font-semibold">الإخصتارات</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-SkyLight "
              href={`/dashboard/list/classes?supervisorId=${"teacher2"}`}
            >
              حصص المدرس
            </Link>
            <Link
              className="p-3 rounded-md bg-PurpleLight "
              href={`/dashboard/list/students?teacherId=${"teacher2"}`}
            >
              طلاب المدرس
            </Link>
            <Link
              className="p-3 rounded-md bg-YellowLight "
              href={`/dashboard/list/lessons?teacherId=${"teacher2"}`}
            >
              دروس المدرس
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 "
              href={`/dashboard/list/exams?teacherId=${"teacher2"}`}
            >
              إمتحانات المدرس
            </Link>
            <Link
              className="p-3 rounded-md bg-SkyLight "
              href={`/dashboard/list/assignments?teacherId=${"teacher2"}`}
            >
              واجبات المدرس
            </Link>
          </div>
        </div>
        <Announcements />
      </div>
      {/*left */}
      <div className="w-full xl:w-2/3">
        {/*top */}
        <div className="flex flex-col lg:flex-row-reverse gap-4">
          {/*user card */}
          <div className="bg-Sky py-6 px-4 rounded-md flex-1 flex gap-4 flex-row-reverse">
            <div className="w-1/3">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4 text-right order-1">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name + " " + teacher.surname}
                </h1>

                {role === "admin" && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>
              <p className="text-sm text-gray-500 break-words overflow-hidden text-ellipsis">
                حبيبي والله
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span className="truncate">{teacher.bloodType}</span>
                  <Image src="/blood.png" alt="" width={14} height={14} />
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span className="truncate">
                    {new Intl.DateTimeFormat("ar-SY").format(teacher.birthday)}
                  </span>
                  <Image src="/date.png" alt="" width={14} height={14} />
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span className="break-words overflow-hidden text-ellipsis">
                    {teacher.email || "-"}
                  </span>
                  <Image src="/mail.png" alt="" width={14} height={14} />
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span>{teacher.phone || "-"}</span>
                  <Image src="/phone.png" alt="" width={14} height={14} />
                </div>
              </div>
            </div>
          </div>
          {/*small card */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap ">
            {/*card */}
            
            {/*card */}
            <div className="bg-white p-4 rounded-md flex flex-col items-center justify-center text-center gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.subjects}
                </h1>
                <span className="text-sm text-gray-400">المواد</span>
              </div>
            </div>
            {/*card */}
            <div className="bg-white p-4 rounded-md flex flex-col items-center justify-center text-center gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] ">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.lessons}
                </h1>
                <span className="text-sm text-gray-400">الدروس</span>
              </div>
            </div>
            {/*card */}
            <div className="bg-white p-4 rounded-md flex flex-col items-center justify-center text-center gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {teacher._count.classes}
                </h1>
                <span className="text-sm text-gray-400">الحصص الدراسية</span>
              </div>
            </div>
          </div>
        </div>
        {/*bottom */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px] ">
          <h1>جدول المدرس</h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>
    </div>
  );
};

export default SingleTeacherPage;
