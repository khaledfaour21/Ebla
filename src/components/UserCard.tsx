import prisma from "@/lib/prisma"
import Image from "next/image"

const UserCard =async ({type}:{type:"مشرف" | "مدرس" | "طالب" | "ولي أمر"}) => {

const modelMap : Record<typeof type, any> = {
    مشرف: prisma.admin,
    مدرس: prisma.teacher,
    طالب: prisma.student,
    "ولي أمر": prisma.parent,
}




const data = await modelMap[type].count()




    return (
        <div className="rounded-2xl odd:bg-Purple even:bg-Yellow p-4 flex-1 min-w-[130px] 
               shadow-lg transition-shadow duration-300 hover:shadow-2xl cursor-pointer">
  {/* ... المحتوى الداخلي يبقى كما هو ... */}
  <h1 className="text-2xl font-semibold my-4 text-center">{data}</h1>
  <h2 className="text-sm font-medium text-gray-500 text-right">{type}</h2>
</div>
    )
}

export default UserCard