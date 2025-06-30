import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = await auth();

  // في حال لم يكن هناك مستخدم مسجل الدخول
  if (!userId) {
    return <div className="p-4">الرجاء تسجيل الدخول لعرض البرنامج.</div>;
  }

  // نجلب قائمة الشعب التي ينتمي إليها الطالب
  const studentClasses = await prisma.class.findMany({
    where: {
      students: { some: { id: userId } },
    },
  });

  // في حال لم يكن الطالب مسجلاً في أي شعبة
  if (studentClasses.length === 0) {
    return <div className="p-4">أنت غير مسجل في أي شعبة دراسية حالياً.</div>;
  }

  // نأخذ أول شعبة مسجل بها الطالب
  const currentClass = studentClasses[0];

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/*left */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>

      {/*right */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          {/* --- هذا هو التعديل المطلوب --- */}
          <h1 className="text-xl font-semibold text-right p-2">
            البرنامج ({currentClass.name})
          </h1>
          <BigCalendarContainer type="classId" id={currentClass.id} />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;