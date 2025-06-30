import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server"; // <-- استيراد دالة auth

const LibraryListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // --- جلب صلاحية المستخدم مباشرة هنا ---
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  // ------------------------------------

  // --- التعديل الأول: جعل عمود "النشاط" يظهر للمدير والمدرس فقط ---
  const columns = [
    { header: "صورة", accessor: "image" },
    { header: "الصف ", accessor: "title" },
    { header: "السنة الدراسية", accessor: "grade" },
    { header: "رابط تحميل الكتب", accessor: "link" },
    { header: "الوصف", accessor: "description" },
    ...(role === "admin" 
      ? [{ header: "النشاط", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
    >
      <td className="p-2">
        <Image
          src={item.image || "/noavatar.png"}
          alt={item.title}
          width={80}
          height={120}
          className="rounded-md object-cover border bg-gray-100"
          style={{ objectFit: "contain" }}
        />
      </td>
      <td>{item.title}</td>
      <td>{item.grade}</td>
      <td>
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          فتح الرابط
        </a>
      </td>
      <td>{item.description}</td>
      <td>
        <div className="flex items-center gap-2 justify-start">
          {/* --- التعديل الثاني: إظهار أزرار التحكم للمدير والمدرس فقط --- */}
          {(role === "admin" ) && (
            <>
              <FormContainer table="library" type="update" data={item} />
              <FormContainer table="library" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page = "1", search = "" } = searchParams;
  const p = parseInt(page);

  const where = search ? { title: { contains: search } } : {};

  const [data, count] = await prisma.$transaction([
    prisma.library.findMany({
      where,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.library.count({ where }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      {/* Top */}
      <div className="flex flex-row-reverse items-center justify-between mb-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-2">
            {/* --- التعديل الثالث: إظهار زر الإضافة للمدير والمدرس فقط --- */}
            {(role === "admin" ) && (
              <FormContainer table="library" type="create" />
            )}
          </div>
        </div>
        <h1 className="text-lg font-semibold text-right">مكتبة المدرسة</h1>
      </div>

      {/* Table */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LibraryListPage;