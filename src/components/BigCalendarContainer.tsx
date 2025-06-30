import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  // 1. جلب الحصص كالمعتاد
  const lessonsFromDB = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
  });

  // 2. تحويلها إلى أحداث تقويم بتواريخ صحيحة
  const scheduleWithDates = adjustScheduleToCurrentWeek(lessonsFromDB);

  // 3. الخطوة الجديدة: تحويل التواريخ إلى نصوص (Serializable)
  const serializableSchedule = scheduleWithDates.map(event => ({
    ...event,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
  }));

  return (
    <div className="h-full">
      <BigCalendar data={serializableSchedule} />
    </div>
  );
};

export default BigCalendarContainer;