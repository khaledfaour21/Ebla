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
      className="text-xs text-gray-400 hover:text-yellow-600 hover:underline underline-offset-4 transition-colors duration-200"
    >
      استعراض الكل
    </Link>
    <h1 className="text-xl font-semibold">الإعلانات</h1>
  </div>

  {/* القائمة الديناميكية للإعلانات */}
  <div className="flex flex-col gap-4 mt-4">
    {/* نستخدم slice(0, 3) لعرض أول ثلاثة إعلانات فقط */}
    {data.slice(0, 3).map((announcement, index) => {
      // مصفوفة لتغيير الألوان تلقائياً
      const bgColors = ['bg-SkyLight', 'bg-PurpleLight', 'bg-YellowLight'];
      const bgColor = bgColors[index % bgColors.length]; // يختار اللون بناءً على الترتيب

      return (
        <div 
          key={announcement.id}
          className={`${bgColor} rounded-md p-4 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
              {new Intl.DateTimeFormat("en-GB").format(announcement.date)}
            </span>
            <h2 className="font-medium">{announcement.title}</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1 text-right" dir="rtl">
            {announcement.description}
          </p>
        </div>
      );
    })}
  </div>
</div>
  );
};

export default Announcements;
