import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Event } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type EventList = Event & { class: Class | null };

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // جلب صلاحية المستخدم مباشرة
  const { userId: currentUserId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "العنوان", accessor: "title" },
    { header: "الصف", accessor: "class" },
    { header: "الوصف", accessor: "description" },
    { header: "التاريخ", accessor: "date", className: "hidden md:table-cell" },
    { header: "وقت البدء", accessor: "startTime", className: "hidden md:table-cell" },
    { header: "وقت الإنتهاء", accessor: "endTime", className: "hidden md:table-cell" },
    ...(role === "admin" 
      ? [{ header: "النشاط", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: EventList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight">
      <td className="p-4">{item.title}</td>
      <td>{item.class?.name || "عام للجميع"}</td>
      <td>{item.description}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("ar-SY").format(item.startTime)}
      </td>
      <td className="hidden md:table-cell">
        {new Date(item.startTime).toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit", hour12: false })}
      </td>
      <td className="hidden md:table-cell">
        {new Date(item.endTime).toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit", hour12: false })}
      </td>
      <td>
        <div className="flex items-center gap-2 justify-start">
          {(role === "admin" ) && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.EventWhereInput = {};

  if (queryParams.search) {
    query.title = { contains: queryParams.search };
  }

  // --- هذا هو منطق الفلترة الجديد والمُصحَّح ---
  if (role !== "admin") {
    const roleConditions = {
      teacher: { lessons: { some: { teacherId: currentUserId! } } },
      student: { students: { some: { id: currentUserId! } } },
      parent: { students: { some: { parentId: currentUserId! } } },
    };

    const classCondition = roleConditions[role as keyof typeof roleConditions];

    query.OR = [
      { classId: null }, // إظهار الأحداث العامة للجميع
      classCondition ? { class: classCondition } : { classId: -1 },
    ];
  }
  // --- نهاية منطق الفلترة ---


  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { startTime: 'desc' }
    }),
    prisma.event.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4">
            {(role === "admin" ) && (
              <FormContainer table="event" type="create" />
            )}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">كل الأحداث</h1>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventListPage;