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
        <div className="rounded-2xl odd:bg-Purple even:bg-Yellow p-4 flex-1 min-w-[130px]">
           <div className="flex justify-between items-center">
            <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">2025/19</span>
            <Image src="/more.png" alt="" width={20} height={20}/>
           </div>
          <h1 className="text-2xl font-semibold my-4 text-center">{data}</h1>
          <h2 className="text-sm font-medium text-gray-500 text-right">{type}</h2>



        </div>
    )
}

export default UserCard