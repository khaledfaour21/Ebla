import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ParentPage = async () => {
  const { userId } = await auth();

  const students = await prisma.student.findMany({
    where: {
      parentId: userId!,
    },
  });

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row flex-1">
      {/* القسم الأيسر */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>

      {/* القسم الأيمن: جداول الطلاب */}
      <div className="w-full xl:w-2/3 flex flex-col gap-8">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-white p-4 rounded-md shadow"
            style={{ minHeight: 400 }} // ارتفاع مناسب للجدول
          >
            <h1 className="text-xl font-semibold mb-4">
              الجدول الزمني ({student.name} {student.surname})
            </h1>
            <div className="w-full h-[350px]">
              <BigCalendarContainer type="classId" id={student.classId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentPage;
