import Image from "next/image"
import CountChart from "./CountChart"
import prisma from "@/lib/prisma"

const CountChartContainer =async () => {
    const data = await prisma.student.groupBy({
        by: ["sex"],
        _count: true,
    });

    const boys = data.find((d) => d.sex === "MALE")?._count || 0;
    const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;
    return(
         <div className='bg-white rounded-xl w-full h-full p-4'>
                {/*Title */}
                <div className="flex justify-between items-center">
                <Image src="/moreDark.png" alt='' width={20} height={20} className='justify-start'/>
                    <h1 className='text-lg font-semibold'>الطلاب</h1>
                    
                </div>
                {/*Chart */}
                    <CountChart boys={boys} girls={girls}/>
        {/*Buttom */}
        <div className='flex justify-center gap-16'>
         <div className='flex flex-col gap-1'>
            <div className='w-5 h-5 bg-Sky rounded-full'/>
            <h1 className='font-bold'>{boys}</h1>
            <h2 className='text-xs text-gray-300'>ذكور({Math.round((boys/(boys+girls))* 100)}%)</h2>
            </div>
            <div className='flex flex-col gap-1'>
            <div className='w-5 h-5 bg-Yellow rounded-full'/>
            <h1 className='font-bold'>{girls}</h1>
            <h2 className='text-xs text-gray-300'>إناث({Math.round((girls/(boys+girls))* 100)}%)</h2>
            </div>
         </div>
         
        </div>
    )
}

export default CountChartContainer