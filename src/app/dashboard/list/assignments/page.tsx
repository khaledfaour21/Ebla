import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { currentUserId } from "../students/page";

type AssignmentList = Assignment & {
  lesson: { subject: Subject; class: Class; teacher: Teacher };
};

const columns = [
  {
    header: "اسم المادة",
    accessor: "name",
  },
  {
    header: "الحصة",
    accessor: "class",
  },
  {
    header: "الاستاذ",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "تاريخ الاستحقاق",
    accessor: "dueDate",
    className: "hidden md:table-cell",
  },
  ...(role === "admin" || role === "teacher"
    ? [
        {
          header: "النشاط",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: AssignmentList, lessons: any[]) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
  >
    <td className="flex items-center gap-4 p-4 text-center">
      {item.lesson.subject.name}
    </td>
    <td>{item.lesson.class.name}</td>
    <td className="hidden md:table-cell text-right">
      {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
    </td>
    <td className="hidden md:table-cell text-right">
      {new Intl.DateTimeFormat("ar-SY", {
        timeZone: "Asia/Damascus",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(item.dueDate)}
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

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AssignmentWhereInput = {};
  query.lesson = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "search":
            query.lesson.subject = {
              name: { contains: value },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.lesson.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

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
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModal
                table="assignment"
                type="create"
                relatedData={{ lessons }}
              />
            )}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">
          كل المواد المفروضة
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
