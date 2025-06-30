import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";

type ClassList = Class & { supervisor: Teacher };
const columns = [
  {
    header: "اسم الشعبة",
    accessor: "name",
  },

  {
    header: "السعة",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },

  {
    header: "الصف",
    accessor: "grade",
    className: "hidden md:table-cell",
  },

  {
    header: "المدرس",
    accessor: "supervisor",
    className: "hidden md:table-cell",
  },

  ...(role === "admin"
    ? [
        {
          header: "النشاط",
          accessor: "action",
        },
      ]
    : []),
];

// --- دالة renderRow الجديدة والصحيحة ---
const renderRow = (
  item: any // غيرنا النوع إلى any لتجنب أخطاء TypeScript مؤقتاً
) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
  >
    <td className="p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.capacity}</td>

    {/* نعرض هنا رقم الصف الدراسي */}
    <td className="hidden md:table-cell">{item.grade?.level}</td>

    {/* نستخدم علامة الاستفهام (?) لعرض اسم المشرف فقط إذا كان موجوداً */}
    <td className="hidden md:table-cell">
      {item.supervisor?.name} {item.supervisor?.surname}
    </td>

    <td>
      <div className="flex items-center gap-2 justify-start">
        {role === "admin" && (
          <>
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "search":
            query.name = {
              contains: value,
            };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        grade: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      {/* top*/}
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4 ">
          
            {role === "admin" && <FormContainer table="class" type="create" />}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">
          كل الشعب الدراسية
        </h1>
      </div>
      {/*  list*/}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* pagination*/}

      <Pagination page={p} count={count} />
    </div>
  );
};

export default ClassListPage;
