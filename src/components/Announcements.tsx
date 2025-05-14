import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Announcements = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        
        <Link
          href="/dashboard/list/announcements"
          className="text-xs text-gray-400 hover:text-yellow-600"
        >
          استعراض الكل
        </Link>
        <h1 className="text-xl font-semibold">الإعلانات</h1>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data[0] && (
          <div className="bg-SkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[0].date)}
              </span>
              <h2 className="font-medium">{data[0].title}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 text-right" dir="rtl">
              {data[0].description}
            </p>
          </div>
        )}
        {data[1] && (
          <div className="bg-PurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[1].date)}
              </span>
              <h2 className="font-medium">{data[1].title}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 text-right" dir="rtl">
              {data[1].description}
            </p>
          </div>
        )}
        {data[2] && (
          <div className="bg-YellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(data[2].date)}
              </span>
              <h2 className="font-medium">{data[2].title}</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 text-right" dir="rtl">
              {data[2].description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
