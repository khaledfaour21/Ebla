import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";

const columns = [
  { header: "صورة", accessor: "image" },
  { header: "اسم الكتاب", accessor: "title" },
  { header: "السنة الدراسية", accessor: "grade" },
  { header: "رابط الكتاب", accessor: "link" },
  { header: "الوصف", accessor: "description" },
  {
    header: "النشاط",
    accessor: "action",
  },
];

const renderRow = (item: any) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight"
  >
    <td className="p-2 text-center">
      <div className="flex flex-col items-right">
        <Image
          src={item.image}
          alt={item.title}
          width={120}
          height={120}
          className="rounded-md object-cover border bg-gray-100"
          style={{ objectFit: "cover" }}
        />
      </div>
    </td>

    <td className="text-right">{item.title}</td>
    <td className="text-right">{item.grade}</td>
    <td className="text-right">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        فتح الرابط
      </a>
    </td>
    <td className="text-right">{item.description}</td>
    <td className="text-right">
      <div className="flex items-center gap-2 justify-start">
        <FormContainer table="library" type="update" data={item} id={item.id} />
        <FormContainer table="library" type="delete" id={item.id} />
      </div>
    </td>
  </tr>
);

const LibraryListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page = "1", ...queryParams } = searchParams;
  const p = parseInt(page);
  const search = queryParams.search || "";

  const where = search
    ? {
        title: {
          contains: search,
        },
      }
    : {};

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
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormContainer table="library" type="create" />
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
