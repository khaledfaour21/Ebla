import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "القائمة الرئيسية",
    items: [
      {
        icon: "/home.png",
        label: "الرئيسية",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "المدرسين",
        href: "/dashboard/list/teachers",
        visible: ["admin", "teacher"],
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
        visible: ["admin", "teacher"],
      },
      {
        icon: "/subject.png",
        label: "المواد",
        href: "/dashboard/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "الحصص الدراسية",
        href: "/dashboard/list/classes",
        visible: ["admin", "teacher"],
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
        label: "التكليف",
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
      // {
      //   icon: "/message.png",
      //   label: "الرسائل",
      //   href: "/dashboard/list/messages",
      //   visible: ["admin", "teacher", "student", "parent"],
      // },
      {
        icon: "/announcement.png",
        label: "الإعلانات",
        href: "/dashboard/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  // {
  //   title: "غير ذلك",
  //   items: [
  //     {
  //       icon: "/profile.png",
  //       label: "البروفايل",
  //       href: "/dashboard/student/list/[id]/page.tsx",
  //       visible: [ "teacher", "student"],
  //     },
  //     // {
  //     //   icon: "/setting.png",
  //     //   label: "الإعدادات",
  //     //   href: "/settings",
  //     //   visible: ["admin", "teacher", "student", "parent"],
  //     // },
  //     // {
  //     //   icon: "/logout.png",
  //     //   label: "تسجيل الخروج",
  //     //   href: "/logout",
  //     //   visible: ["admin", "teacher", "student", "parent"],
  //     // },
  //   ],
  // },
];


const Menu =async () => {
  const user = await currentUser()
  const role = user?.publicMetadata.role as string
  return (
      <div className="mt-4 text-sm rtl">
        {menuItems.map(i=>(
          <div className="flex flex-col gap-1.5" key={i.title}>
            <span className="hidden lg:block text-gray-400 font-light mb-4 text-right">{i.title}</span>
            {i.items.map(item=>{
              if(item.visible.includes(role)){
                return (
                  <Link
                   href={item.href}
                    key={item.label} 
                    className="flex items-center justify-end gap-4 text-gray-500 py-2 md-px-2 hover:bg-gray-100 rounded-md hover:bg-SkyLight">
                  <Image src={item.icon} alt="" width={20} height={20} className="order-last"/>
                  <span className="hidden lg:block">{item.label}</span>
                  </Link>
                )
              }
            })}
          </div>
        ))}
      </div>
  )
}
  

export default Menu