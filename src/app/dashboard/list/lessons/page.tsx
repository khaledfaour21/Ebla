import prisma from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { Lesson, Class, Subject, Teacher, Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server"; // استيراد دالة الصلاحيات

type LessonList = Lesson & {
  class: Class;
  subject: Subject;
  teacher: Teacher;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // --- جلب صلاحية المستخدم مباشرة ---
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // --- التعديل الأول: إظهار عمود "النشاط" للأدمن فقط ---
  const columns = [
    { header: "اسم الحصة", accessor: "name" },
    { header: "الشعبة", accessor: "class" },
    { header: "المادة", accessor: "subject" },
    { header: "المعلم", accessor: "teacher" },
    { header: "اليوم", accessor: "day" },
    { header: "وقت البداية", accessor: "startTime", className: "hidden md:table-cell" },
    { header: "وقت النهاية", accessor: "endTime", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "النشاط", accessor: "action" }] : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
    >
      <td className="p-4">{item.name}</td>
      <td>{item.class?.name}</td>
      <td>{item.subject?.name}</td>
      <td>
        {item.teacher?.name} {item.teacher?.surname}
      </td>
      <td>{item.day}</td>
      <td className="hidden md:table-cell">{item.startTime}</td>
      <td className="hidden md:table-cell">{item.endTime}</td>

      {/* --- التعديل الثاني: إظهار أزرار التحكم للأدمن فقط --- */}
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="lesson" type="update" data={item} />
            <FormContainer table="lesson" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.LessonWhereInput = {};

  if (queryParams.search) {
    query.name = { contains: queryParams.search };
  }
  
  // (يمكنك إضافة منطق فلترة حسب الدور هنا إذا احتجت مستقبلاً)

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: "asc" },
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      {/* top */}
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4 ">
            {/* التعديل الثالث: زر الإضافة يظهر للأدمن فقط (وهذا كان صحيحاً لديك) */}
            {role === "admin" && <FormContainer table="lesson" type="create" />}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">
          كل الحصص الدراسية
        </h1>
      </div>

      {/* list */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;