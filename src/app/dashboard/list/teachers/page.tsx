import FormContainer from "@/components/FormContainer"
import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import prisma from "@/lib/prisma"
import { ITEM_PER_PAGE } from "@/lib/settings"
import { role } from "@/lib/utils"
import { Class, Prisma, Subject, Teacher } from "@prisma/client"
import { Teachers } from "next/font/google"
import Image from "next/image"
import Link from "next/link"


type TeacherList = Teacher & {subjects: Subject[]} & {classes: Class[]};

const columns = [
    {
        header:"المعلومات" , accessor:"info"
    },

    {
        header:"رقم المدرس" , accessor:"teacherId", className:"hidden md:table-cell"
    },
    
    {
        header:"المواد" , accessor:"subjects", className:"hidden md:table-cell"
    },

    {
        header:"الصفوف" , accessor:"classes", className:"hidden md:table-cell"
    },
    {
        header:"رقم الهاتف" , accessor:"phone", className:"hidden md:table-cell"
    },
    {
        header:"العنوان" , accessor:"address", className:"hidden md:table-cell"
    },
    ...(role === "admin"? [{
        header:"النشاط" , accessor:"action"
    },]:[]),
]
const renderRow = (item:TeacherList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight">
        <td className="flex items-center gap-4 p-4 text-center">
            <Image src={item.img || "/noAvatar.png"} alt="" width={40} height={40} className="md:hidden xl:block w-ITEM_PER_PAGE h-ITEM_PER_PAGE rounded-full object-cover" />
            <div className="flex flex-col">
                <h3 className="font-semibold text-right">{item.name}</h3>
                <p className="text-xs text-gray-500 text-right">{item?.email}</p>
            </div>
        </td>
        <td className="hidden md:table-cell text-right">{item.username}</td>
        <td className="hidden md:table-cell text-right">{item.subjects.map(subject=>subject.name).join(",")}</td>
        <td className="hidden md:table-cell text-right">{item.classes.map(classItem=>classItem.name).join(",")}</td>
        <td className="hidden md:table-cell text-right">{item.phone}</td>
        <td className="hidden md:table-cell text-right">{item.address}</td>
        <td>
            <div className="flex items-center gap-2 justify-start">
                <Link href={`/dashboard/list/teachers/${item.id}`}>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-Sky">
                    <Image src="/view.png" alt="" width={16} height={16}/>
                 </button>
                </Link>
                {role === "admin" && (
               /* <button className="w-7 h-7 flex items-center justify-center rounded-full bg-Purple">
                    <Image src="/delete.png" alt="" width={16} height={16}/>
                 </button>*/
                 <FormContainer table="teacher" type="delete" id={item.id}/>
                )}
            </div>
        </td>
    </tr>
    );
    
const TeacherListPage = async ({
    searchParams
}:{
    searchParams:{[key:string]:string | undefined};
}) => {

    const {page, ...queryParams} =await searchParams;

    const p=page ? parseInt(page) : 1;

    const query: Prisma.TeacherWhereInput = {};
    
    if(queryParams){
        for(const [key,value] of Object.entries(queryParams)){
            if (value !== undefined) {
            switch(key){
                case "classId":
                    query.lessons = {some:{classId:parseInt(value),

                    },
                };
                break;
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
   prisma.teacher.findMany({
     where: query,
    include : {
        subjects: true,
        classes: true,
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p-1),
  }),
   prisma.teacher.count({where:query}),
])
  

  console.log(count);

 // console.log(data)


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
                        { role === "admin" && (
                           /* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image src="/plus.png" alt="" width={14} height={14}/>
                        </button>
                        */
                        <FormContainer table="teacher" type="create"/>
                        )}
                    </div>
                </div>
                <h1 className="hidden md:block text-lg font-semibold text-right" >كل المدرسين</h1>
            </div>
            {/*  list*/}
            <Table columns={columns} renderRow={renderRow} data={data}/>
            {/* pagination*/}
            
                <Pagination page={p} count={count}/>
            
        </div>
    )
}

export default TeacherListPage