// في ملف src/lib/utils.ts

import { Lesson } from "@prisma/client"; // تأكد من استيراد نوع Lesson

// 1. أضفنا هذا الكائن المساعد لتحويل اسم اليوم إلى رقم
const dayToNumber = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// 2. نسخة مُحسَّنة من دالة حساب بداية الأسبوع (يبدأ من يوم الأحد)
const currentWorkWeek = () => {
  const today = new Date();
  // معادلة بسيطة للرجوع إلى يوم الأحد من الأسبوع الحالي
  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay()
  );
  startOfWeek.setHours(0, 0, 0, 0); // إعادة ضبط الوقت إلى منتصف الليل
  return startOfWeek;
};

// 3. الدالة الرئيسية بعد إعادة كتابتها بالكامل
export const adjustScheduleToCurrentWeek = (
  lessons: Lesson[]
): { title: string; start: Date; end: Date }[] => {
  const startOfWeek = currentWorkWeek(); // حساب بداية الأسبوع الحالي

  return lessons
    .map((lesson) => {
      // تحويل اسم اليوم (مثل "MONDAY") إلى رقم (1)
      const lessonDayOfWeek = dayToNumber[lesson.day];

      // إذا كان اليوم غير صحيح، تجاهل هذه الحصة
      if (lessonDayOfWeek === undefined) {
        return null;
      }

      // حساب التاريخ الصحيح للحصة في الأسبوع الحالي
      // (بداية الأسبوع + رقم اليوم)
      const adjustedStartDate = new Date(startOfWeek);
      adjustedStartDate.setDate(startOfWeek.getDate() + lessonDayOfWeek);

      // استخراج الساعة والدقيقة من النص (مثال: "09:30")
      const [startHours, startMinutes] = lesson.startTime.split(":").map(Number);
      adjustedStartDate.setHours(startHours, startMinutes, 0, 0); // ضبط الوقت

      // القيام بنفس الشيء لوقت النهاية
      const adjustedEndDate = new Date(adjustedStartDate);
      const [endHours, endMinutes] = lesson.endTime.split(":").map(Number);
      adjustedEndDate.setHours(endHours, endMinutes, 0, 0);

      // إرجاع كائن جديد بالتنسيق الذي يفهمه التقويم
      return {
        title: lesson.name, // استخدمنا lesson.name بدلاً من lesson.title
        start: adjustedStartDate,
        end: adjustedEndDate,
      };
    })
    .filter(Boolean) as { title: string; start: Date; end: Date }[]; // ترشيح أي قيم فارغة
};