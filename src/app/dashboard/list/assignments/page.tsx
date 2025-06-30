import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId: currentUserId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "عنوان الواجب", accessor: "title" },
    { header: "اسم المادة", accessor: "name" },
    { header: "الحصة", accessor: "class" },
    { header: "الاستاذ", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "تاريخ الاستحقاق", accessor: "dueDate", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "النشاط", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: AssignmentList, lessons: any[]) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
    >
      <td className="p-4 whitespace-normal break-words max-w-xs">{item.title}</td>
      <td>{item.lesson.subject.name}</td>
      <td>{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">
        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
      </td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("ar-SY").format(item.dueDate)}
      </td>
      <td>
        <div className="flex items-center gap-2 justify-start">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormModal
                table="assignment"
                type="update"
                data={item}
                relatedData={{ lessons }}
              />
              <FormModal table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // --- منطق الفلترة الجديد والمُحسَّن ---
  const query: Prisma.AssignmentWhereInput = {};
  const lessonWhere: Prisma.LessonWhereInput = {};

  // 1. التعامل مع الفلاتر القادمة من الرابط (URL)
  if (queryParams.search) {
    query.OR = [
      { title: { contains: queryParams.search } },
      { lesson: { subject: { name: { contains: queryParams.search } } } }
    ];
  }
  if (queryParams.classId) {
    lessonWhere.classId = parseInt(queryParams.classId);
  }

  // 2. التحقق من وجود فلتر للمدرس في الرابط
  if (queryParams.teacherId) {
    // إذا وجد، استخدمه وتجاهل دور المستخدم الحالي
    lessonWhere.teacherId = queryParams.teacherId;
  } else {
    // 3. إذا لم يوجد، طبق الفلترة حسب دور المستخدم
    switch (role) {
      case "admin":
        break;
      case "teacher":
        lessonWhere.teacherId = currentUserId!;
        break;
      case "student":
        lessonWhere.class = { students: { some: { id: currentUserId! } } };
        break;
      case "parent":
        lessonWhere.class = { students: { some: { parentId: currentUserId! } } };
        break;
      default:
        query.id = -1;
        break;
    }
  }

  // أضف شروط الحصة إلى البحث الرئيسي فقط إذا كانت تحتوي على شروط
  if (Object.keys(lessonWhere).length > 0) {
    query.lesson = lessonWhere;
  }
  // --- نهاية منطق الفلترة ---


  const [data, count, lessons] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
    prisma.lesson.findMany({
      include: {
        subject: true,
        teacher: true,
        class: true,
      },
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      {/* top */}
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4">
            {(role === "admin" || role === "teacher") && (
              <FormModal
                table="assignment"
                type="create"
                relatedData={{ lessons }}
              />
            )}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">
          كل الواجبات
        </h1>
      </div>

      {/* list */}
      <Table
        columns={columns}
        renderRow={(item) => renderRow(item, lessons)}
        data={data}
      />

      {/* pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AssignmentListPage;