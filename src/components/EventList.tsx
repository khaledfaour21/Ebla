import prisma from "@/lib/prisma";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server"; // استيراد دالة الصلاحيات
import { Prisma } from "@prisma/client"; // استيراد أنواع Prisma

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  // 1. جلب صلاحية ودور المستخدم
  const { userId: currentUserId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // 2. بناء شرط التاريخ (إما ليوم محدد أو للأحداث القادمة)
  const dateCondition = dateParam
    ? {
        startTime: {
          gte: new Date(new Date(dateParam).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(dateParam).setHours(23, 59, 59, 999)),
        },
      }
    : {
        startTime: {
          gte: new Date(),
        },
      };
      
  // 3. بناء شرط الصلاحية
  let permissionCondition = {};
  if (role !== "admin") {
    const roleConditions = {
      teacher: { lessons: { some: { teacherId: currentUserId! } } },
      student: { students: { some: { id: currentUserId! } } },
      parent: { students: { some: { parentId: currentUserId! } } },
    };
    const classCondition = roleConditions[role as keyof typeof roleConditions];

    permissionCondition = {
      OR: [
        { classId: null }, // الأحداث العامة
        classCondition ? { class: classCondition } : { classId: -1 }, // الأحداث الخاصة بالدور
      ],
    };
  }

  // 4. دمج شرط التاريخ مع شرط الصلاحية
  const whereClause: Prisma.EventWhereInput = {
    ...dateCondition,
    ...permissionCondition,
  };

  const data = await prisma.event.findMany({
    where: whereClause,
    orderBy: {
      startTime: "asc",
    },
    take: dateParam ? undefined : 3, // عرض 3 أحداث فقط في الشاشة الرئيسية
  });

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center p-4">
        {dateParam ? "لا توجد أحداث في هذا اليوم." : "لا توجد أحداث قادمة."}
      </p>
    );
  }

  return data.map((event) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-Sky even:border-t-Purple 
                 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-xs">
          {new Date(event.startTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
        <h1 className="font-semibold text-gray-600">{event.title}</h1>
      </div>
      <p className="mt-2 text-gray-400 text-sm text-right" dir="rtl">
        {event.description}
      </p>
    </div>
  ));
};

export default EventList;