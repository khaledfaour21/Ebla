import prisma from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { Lesson, Class, Subject, Teacher } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import { role } from "@/lib/data";

type LessonList = Lesson & {
  class: Class;
  subject: Subject;
  teacher: Teacher;
};

const columns = [
  { header: "اسم الحصة", accessor: "name" },
  { header: "الصف", accessor: "class" },
  { header: "المادة", accessor: "subject" },
  { header: "المعلم", accessor: "teacher" },
  { header: "اليوم", accessor: "day" },
  { header: "وقت البداية", accessor: "startTime", className: "hidden md:table-cell" },
  { header: "وقت النهاية", accessor: "endTime", className: "hidden md:table-cell" },
  { header: "النشاط", accessor: "action" },
];

const renderRow = (item: LessonList) => (
  <tr key={item.id} className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight">
    <td className="p-4">{item.name}</td>
    <td>{item.class?.name}</td>
    <td>{item.subject?.name}</td>
    <td>{item.teacher?.name} {item.teacher?.surname}</td>
    <td>{item.day}</td>
    <td className="hidden md:table-cell">{new Date(item.startTime).toLocaleTimeString()}</td>
    <td className="hidden md:table-cell">{new Date(item.endTime).toLocaleTimeString()}</td>
    <td>
      <div className="flex items-center gap-2">
        <FormContainer table="lesson" type="update" data={item} />
        <FormContainer table="lesson" type="delete" id={item.id} />
      </div>
    </td>
  </tr>
);

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: any = {};

  if (queryParams.search) {
    Object.assign(query, {
      name: { contains: queryParams.search }, // حذف mode: "insensitive"
    });
  }

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
      {/* top*/}
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4 ">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="فلتر" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="فرز" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="lesson" type="create" />
            )}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">كل الدروس</h1>
      </div>

      {/* list */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;
