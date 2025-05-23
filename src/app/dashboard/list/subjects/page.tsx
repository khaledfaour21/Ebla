import FormContainer from "@/components/FormContainer"
import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import { parentsData, role, studentsData, subjectsData, teachersData } from "@/lib/data"
import prisma from "@/lib/prisma"
import { ITEM_PER_PAGE } from "@/lib/settings"
import { Prisma, Subject, Teacher } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

type SubjectList = Subject & {teachers: Teacher[]}

const columns = [
    {
        header:"اسم المادة" , accessor:"name"
    },

    {
        header:"مدرس المادة" , accessor:"teachers", className:"hidden md:table-cell"
    },
    
    {
        header:"النشاط" , accessor:"action"
    },
]
const renderRow = (item:SubjectList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight">
        <td className="flex items-center gap-4 p-4 text-center">
        {item.name}
            
            
        </td>
        <td className="hidden md:table-cell text-right">{item.teachers.map((teacher) => teacher.name).join(",")}</td>
        <td>
            <div className="flex items-center gap-2 justify-start">
            {role === "admin" && (<>
            <FormContainer table="subject" type="update" data={item}/>
                
                <FormContainer table="subject" type="delete" id={item.id}/>
                </>
                )}
            </div>
        </td>
    </tr>
    )

const SubjectListPage = async ({
    searchParams
}:{
    searchParams:{[key:string]:string | undefined};
}) => {

    const {page, ...queryParams} =await searchParams;

    const p=page ? parseInt(page) : 1;

    const query: Prisma.SubjectWhereInput = {};
    
    if(queryParams){
        for(const [key,value] of Object.entries(queryParams)){
            if (value !== undefined) {
            switch(key){
                case "search":
                    query.name = {
                        contains:value,
                         
                        }
                        break;
                        default:break;

            }
          }
        }
    }
  
  const [data,count] = await prisma.$transaction([
   prisma.subject.findMany({
     where: query,
    include : {
        
        teachers: true,
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p-1),
  }),
   prisma.subject.count({where:query}),
])
  
  



    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0" dir="rtl">
            {/* top*/}
            <div className="flex flex-row-reverse items-center justify-between">
                
                <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto justify-start">
                    <TableSearch/>
                    <div className="flex items-center gap-4 ">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image src="/filter.png" alt="" width={14} height={14}/>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image src="/sort.png" alt="" width={14} height={14}/>
                        </button>
                       {role === "admin" && ( 
                        <FormContainer table="subject" type="create"/>

                       )}
                    </div>
                </div>
                <h1 className="hidden md:block text-lg font-semibold text-right">كل المواد</h1>
            </div>
            {/*  list*/}
            <Table columns={columns} renderRow={renderRow} data={data}/>
            {/* pagination*/}
            
                <Pagination page={p} count={count}/>
            
        </div>
    )
}

export default SubjectListPage