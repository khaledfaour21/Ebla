import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Class, Student, Grade } from "@prisma/client"; // أضفنا Grade هنا
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // جلب بيانات الطالب مع الشعبة والصف الدراسي
  const student:
    | (Student & {
        class: (Class & { _count: { lessons: number } }) | null;
        grade: Grade | null;
      })
    | null = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { include: { _count: { select: { lessons: true } } } },
      grade: true, // جلب بيانات الصف الدراسي
    },
  });

  if (!student) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/*right */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md text-right" dir="rtl">
          <h1 className="text-xl font-semibold">الإختصارات</h1>
          {/* روابط ديناميكية صحيحة */}
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
          
            <Link
              className="p-3 rounded-md bg-PurpleLight "
              href={`/dashboard/list/teachers?classId=${student.classId}`}
            >
              اساتذة الطالب
            </Link>
            <Link
              className="p-3 rounded-md bg-YellowLight "
              href={`/dashboard/list/results?studentId=${student.id}`}
            >
              نتائج الطالب
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 "
              href={`/dashboard/list/exams?classId=${student.classId}`}
            >
              إمتحانات الطالب
            </Link>
            <Link
              className="p-3 rounded-md bg-SkyLight "
              href={`/dashboard/list/assignments?classId=${student.classId}`}
            >
              واجبات الطالب
            </Link>
          </div>
        </div>
      </div>
      {/*left */}
      <div className="w-full xl:w-2/3">
        {/*top */}
        <div className="flex flex-col lg:flex-row-reverse gap-4">
          {/*user card */}
          <div className="bg-Sky py-6 px-4 rounded-md flex-1 flex gap-4 flex-row-reverse">
            <div className="w-1/3">
              <Image
                src={student.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4 text-right order-1">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name + " " + student.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>
              <p className="text-sm text-gray-500 break-words overflow-hidden text-ellipsis">
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                 {/* ... بيانات الطالب الشخصية مع أيقوناتها ... */}
                 <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span className="truncate">{student.bloodType}</span>
                  <Image src="/blood.png" alt="" width={14} height={14} />
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span className="truncate">
                    {new Intl.DateTimeFormat("ar-SY").format(student.birthday)}
                  </span>
                  <Image src="/date.png" alt="" width={14} height={14} />
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span className="break-words overflow-hidden text-ellipsis">
                    {student.email || "-"}
                  </span>
                  <Image src="/mail.png" alt="" width={14} height={14} />
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2 justify-end">
                  <span>{student.phone || "-"}</span>
                  <Image src="/phone.png" alt="" width={14} height={14} />
                </div>
              </div>
            </div>
          </div>
          {/*small card */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap ">
            <div className="bg-white p-4 rounded-md flex flex-col items-center justify-center text-center gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6"/>
              <div>
                <h1 className="text-xl font-semibold">{student.grade?.level}</h1>
                <span className="text-sm text-gray-400">الصف</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex flex-col items-center justify-center text-center gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] ">
              <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6"/>
              <div>
                <h1 className="text-xl font-semibold">{student.class?._count.lessons}</h1>
                <span className="text-sm text-gray-400">الدروس</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md flex flex-col items-center justify-center text-center gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6"/>
              <div>
                <h1 className="text-xl font-semibold">{student.class?.name}</h1>
                <span className="text-sm text-gray-400">الشعبة</span>
              </div>
            </div>
          </div>
        </div>
        {/*bottom */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]" dir="rtl">
          <h1>جدول حصص الطالب</h1>
          {student.classId ? (
            <BigCalendarContainer type="classId" id={student.classId} />
          ) : (
            <div className="flex justify-center items-center h-full">الطالب غير مسجل في أي شعبة.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleStudentPage;