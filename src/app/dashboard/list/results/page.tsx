import FormContainer from "@/components/FormContainer"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import prisma from "@/lib/prisma"
import { ITEM_PER_PAGE } from "@/lib/settings"
import { auth } from "@clerk/nextjs/server"
import { Result, Student, Lesson, Subject, Teacher, Prisma } from "@prisma/client"

type FullResult = Result & {
  student: Student
  lesson: Lesson & {
    subject: Subject
    teacher: Teacher
  }
}

const columns = [
  { header: "اسم الطالب", accessor: "student" },
  { header: "اسم المادة", accessor: "subject" },
  { header: "اسم الأستاذ", accessor: "teacher" },
  { header: "مذاكرة 1", accessor: "quiz1" },
  { header: "مذاكرة 2", accessor: "quiz2" },
  { header: "وظائف", accessor: "homework" },
  { header: "شفهي", accessor: "oral" },
  { header: "فحص نهائي", accessor: "final" },
  { header: "المجموع", accessor: "total" },
  { header: "ملاحظات", accessor: "note" },
  { header: "النشاط", accessor: "action" },
]

// ✅ اجعلها React Component Asynchronously
const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) => {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  const currentUserId = userId

  const { page, term = "FIRST", ...queryParams } = searchParams
  const p = page ? parseInt(page) : 1
  const selectedTerm = term === "SECOND" ? "SECOND" : "FIRST"

  const query: Prisma.ResultWhereInput = {
    term: selectedTerm,
  }

  const search = queryParams.search || ""
  if (search) {
    query.student = {
      name: {
        contains: search,
      },
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: true,
        lesson: {
          include: {
            subject: true,
            teacher: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ])

  const renderRow = (item: FullResult) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight">
      <td className="text-right">{item.student.name} {item.student.surname}</td>
      <td className="text-right">{item.lesson?.subject?.name ?? "-"}</td>
      <td className="text-right">{item.lesson?.teacher?.name ?? "-"}</td>
      <td className="text-right">{item.quiz1 ?? "-"}</td>
      <td className="text-right">{item.quiz2 ?? "-"}</td>
      <td className="text-right">{item.homework ?? "-"}</td>
      <td className="text-right">{item.oral ?? "-"}</td>
      <td className="text-right">{item.final ?? "-"}</td>
      <td className="text-right">{item.total ?? "-"}</td>
      <td className="text-right">{item.note ?? "-"}</td>
      {(role === "admin" || role === "teacher") && (
        <td>
          <div className="flex items-center gap-2 justify-start">
            <FormContainer table="result" type="update" data={item} id={item.id} />
            <FormContainer table="result" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  )

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
      {/* top */}
      <div className="flex flex-row-reverse items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-start">
          <TableSearch />
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <img src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
              <img src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
        <h1 className="hidden md:block text-lg font-semibold text-right">نتائج الطلاب</h1>
      </div>

      {/* فصل أول / فصل ثاني */}
      <div className="flex justify-start gap-2 my-4">
        <a
          href="?term=FIRST"
          className={`px-4 py-2 text-sm rounded-md ${
            selectedTerm === "FIRST"
              ? "bg-Purple text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          الفصل الأول
        </a>
        <a
          href="?term=SECOND"
          className={`px-4 py-2 text-sm rounded-md ${
            selectedTerm === "SECOND"
              ? "bg-Purple text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          الفصل الثاني
        </a>
      </div>

      {/* table */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* pagination */}
      <Pagination page={p} count={count} />
    </div>
  )
}

export default ResultListPage