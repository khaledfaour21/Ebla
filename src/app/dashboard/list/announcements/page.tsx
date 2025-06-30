import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Announcement } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AnnouncementList = Announcement & { class: Class | null };

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // --- جلب صلاحية المستخدم مباشرة هنا ---
  const { userId: currentUserId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  // ------------------------------------

  const columns = [
    { header: "العنوان", accessor: "title" },
    { header: "الصف", accessor: "class" },
    { header: "الوصف", accessor: "description" },
    { header: "التاريخ", accessor: "date", className: "hidden md:table-cell" },
    // إظهار عمود "النشاط" للمدير والمدرس
    ...(role === "admin" 
      ? [{ header: "النشاط", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: AnnouncementList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
    >
      <td className="p-4">{item.title}</td>
      <td>{item.class?.name || "عام للجميع"}</td>
      <td>{item.description}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("ar-SY", {
          timeZone: "Asia/Damascus",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(item.date)}
      </td>
      <td>
        <div className="flex items-center gap-2 justify-start">
          {(role === "admin" ) && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams.search) {
    query.title = {
      contains: queryParams.search,
    };
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
      { classId: null }, // إظهار الإعلانات العامة للجميع
      classCondition ? { class: classCondition } : { classId: -1 }, // { classId: -1 } لمنع عرض أي شيء إذا كان الدور غير معروف
    ];
  }
  // --- نهاية منطق الفلترة ---


  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: 'desc' }
    }),
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4">
            {(role === "admin" ) && (
              <FormContainer table="announcement" type="create" />
            )}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">
          كل الإعلانات
        </h1>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={p} count={count} />
    </div>
  );
};

export default AnnouncementListPage;