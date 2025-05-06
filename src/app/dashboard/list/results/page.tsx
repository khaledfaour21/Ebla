import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import prisma from "@/lib/prisma"
import { ITEM_PER_PAGE } from "@/lib/settings"
import { currentUserId, role } from "@/lib/utils"
import { currentUser } from "@clerk/nextjs/server"
import { Prisma } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { title } from "process"

type ResultList = {
    id: number;
        title:string;
        studentName: string;
        studentSurname: string;
        teacherName: string;
        teacherSurname:string;
        score: number;
        className: string;
        startTime: Date;  
}

const columns = [
    {
        header:"العنوان" , accessor:"title"
    },

    {
        header:"الطالب" , accessor:"student",  
    },
    {
        header:"العلامة" , accessor:"score",  className: "hidden md:table-cell", 
    },
    
    
    
    
    {
        header:"الاستاذ" , accessor:"teacher", className: "hidden md:table-cell", 
    },
    {
        header:"الحصة" , accessor:"class",  className: "hidden md:table-cell", 
    },
    {
        header:"التاريخ" , accessor:"date", className: "hidden md:table-cell", 
    },
   
    
    ...(role  === "admin" || role === "teacher" ?[{
        header:"النشاط" , accessor:"action"
    },]:[]),
]
const renderRow = (item:ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-state-50 text-sm hover:bg-PurpleLight">
        <td className="flex items-center gap-4 p-4 text-center">{item.title}</td>
        <td >{item.studentName + " " + item.studentSurname}</td>
        <td className="hidden md:table-cell text-right">{item.score}</td>
        <td className="hidden md:table-cell text-right">{item.teacherName + " " + item.teacherSurname}</td>
        <td className="hidden md:table-cell text-right">{item.className}</td>
        <td className="hidden md:table-cell text-right">{new Intl.DateTimeFormat("ar-SY", {timeZone: "Asia/Damascus",year: 'numeric',month: '2-digit',day: '2-digit',}).format(item.startTime)}</td>
        
        <td>
            <div className="flex items-center gap-2 justify-start">
            {(role === "admin" || role === "teacher") && ( <>
            <FormModal table="result" type="update" data={item}/>
                
                <FormModal table="result" type="delete" id={item.id}/>
                </>
                )}
            </div>
        </td>
    </tr>
    )

const ResultListPage = async ({
    searchParams
}:{
    searchParams:{[key:string]:string | undefined};
}) => {

    const {page, ...queryParams} =await searchParams;

    const p=page ? parseInt(page) : 1;

    const query: Prisma.ResultWhereInput = {};
    
    if(queryParams){
        for(const [key,value] of Object.entries(queryParams)){
            if (value !== undefined) {
            switch(key){
                case "studentId":
                    query.studentId = value;
                        break;
                        
                        case "search":
                    query.OR = [
                        {exam: {title:{contains: value}}},
                        { student: {name: {contains: value}}}
                    ]
                        break;
                        default:break;

            }
          }
        }
    }



    switch (role) {
        case "admin":
            break;
        case "teacher":
            query.OR = [
                { exam: {lesson: {teacherId: currentUserId!}}},
                { assignment: {lesson: {teacherId: currentUserId!}}},
             ];
             break;

             case "student":
                query.studentId = currentUserId!;
                break;
            case "parent":
                query.student = {
                    parentId: currentUserId!,
                };
                break;
            

            default:break;

    }
  
  const [dataRes,count] = await prisma.$transaction([
   prisma.result.findMany({
     where: query,
    include : {
        student: {select: {name: true, surname:true }},
        exam:{
            include: {
                lesson:{
                    select: {
                    class:{select: { name:true}},
                    teacher:{select: { name:true ,surname:true}},

                    }}
            }
        },
        assignment:{
            include: {
                lesson:{
                    select: {
                    class:{select: { name:true}},
                    teacher:{select: { name:true ,surname:true}},

                    }}
            }
        }
        
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p-1),
  }),
   prisma.result.count({where:query}),
])
  

const data = dataRes.map(item=>{
    const assessment = item.exam || item.assignment;

    if(!assessment ) return null;

    const isExam = "startTime" in assessment;
    return {
        id: item.id,
        title:assessment.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: assessment.lesson.teacher.name,
        teacherSurname:assessment.lesson.teacher.surname,
        score: item.score,
        className: assessment.lesson.class.name,
        startTime: isExam ? assessment.startTime: assessment.startDate,  
    }
})
  



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
                       {(role === "admin" || role === "teacher") && ( 
                        <FormModal table="result" type="create"/>

                       )}
                    </div>
                </div>
                <h1 className="hidden md:block text-lg font-semibold text-right">كل النتائج</h1>
            </div>
            {/*  list*/}
            <Table columns={columns} renderRow={renderRow} data={data}/>
            {/* pagination*/}
            
                <Pagination page={p} count={count}/>
            
        </div>
    )
}

export default ResultListPage