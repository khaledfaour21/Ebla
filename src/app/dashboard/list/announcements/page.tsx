import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";

type AnnouncementList = Announcement & { class: Class };

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "العنوان",
      accessor: "title",
    },

    {
      header: "الصف",
      accessor: "class",
    },
    {
      header: "التاريخ",
      accessor: "date",
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
  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
    >
      <td className="flex items-center gap-4 p-4 text-center">{item.title}</td>
      <td>{item.class?.name || "---"}</td>
      <td className="hidden md:table-cell text-right">
        {new Intl.DateTimeFormat("ar-SY", {
          timeZone: "Asia/Damascus",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(item.date)}
      </td>
      <td>
        <div className="flex items-center gap-2 justify-start">
          {role === "admin" && (
            <>
              <FormModal table="announcement" type="update" data={item} />

              <FormModal table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = await searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = {
              contains: value,
            };
            break;
          default:
            break;
        }
      }
    }
  }

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: currentUserId! } } },
    student: { students: { some: { id: currentUserId! } } },
    parent: { students: { some: { parentId: currentUserId! } } },
  };
  query.OR = [
    { classId: null },
    {
      class: roleConditions[role as keyof typeof roleConditions] || {},
    },
  ];

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      {/* top*/}
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4 ">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModal table="announcement" type="create" />
            )}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">
          كل الإعلانات
        </h1>
      </div>
      {/*  list*/}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* pagination*/}

      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementListPage;
