import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

// تعريف القائمة كمصفوفة واحدة صحيحة
const menuItems = [
  {
    title: "القائمة الرئيسية",
    items: [
      {
        icon: "/home.png",
        label: "الرئيسية",
        href: "/dashboard",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "المدرسين",
        href: "/dashboard/list/teachers",
        visible: ["admin"],
      },
      {
        icon: "/student.png",
        label: "الطلاب",
        href: "/dashboard/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "الآباء",
        href: "/dashboard/list/parents",
        visible: ["admin"],
      },
      {
        icon: "/subject.png",
        label: "المواد",
        href: "/dashboard/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "الشعب الدراسية",
        href: "/dashboard/list/classes",
        visible: ["admin"],
      },
      {
        icon: "/lesson.png",
        label: "الدروس",
        href: "/dashboard/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "الإمتحانات",
        href: "/dashboard/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "الواجبات",
        href: "/dashboard/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "النتائج",
        href: "/dashboard/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/library.png",
        label: "المكتبة",
        href: "/dashboard/list/library",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "الأحداث",
        href: "/dashboard/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "الإعلانات",
        href: "/dashboard/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
          label: "من نحن",
          href: "/dashboard/list/school", // تم تصحيح الرابط
          icon: "/school.png",
          visible: ["admin", "teacher", "student", "parent"],
        },
    ],
  },
  {
    title: "أدوات مساعدة",
    items: [
        {
          label: "المساعد الذكي",
          href: "/dashboard/ai-helper",
          icon: "/robot.png",
          visible: ["admin", "teacher", "student", "parent"],
        },
        
    ]
  },
  {
    title: "عمليات النظام",
    items: [
      {
        label: "عمليات نهاية العام",
        href: "/dashboard/settings",
        icon: "/promote.png",
        visible: ["admin"], // مرئي للمدير فقط
      },
    ],
  },
];

// جعل المكون async لجلب بيانات المستخدم
const Menu = async () => {
  // نقلنا منطق جلب الصلاحيات إلى داخل المكون
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "";

  return (
    <div className="mt-4 text-sm rtl">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-1.5 mb-4" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light mb-2 text-right">
            {i.title}
          </span>
          {i.items.map((item) => {
            // التحقق من الصلاحية قبل عرض الرابط
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-end gap-4 text-gray-500 p-2 rounded-md transition-all duration-200 hover:bg-SkyLight hover:text-black hover:translate-x-2"
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={20}
                    height={20}
                    className="order-last"
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
            return null; // لا تعرض الرابط إذا لم يكن المستخدم مخولاً
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;