import prisma from "@/lib/prisma"

const StudentAttendanceCard = async ({id}:{id:string}) => {

    const attendance =await prisma.attendance.findMany({
        where:{
            studentId:id,
            date:{
                gte:new Date(new Date().getFullYear(),0,),
            }
        }
    })


    const totalDays = attendance.length;
    const presentDays = attendance.filter((day) => day.present).length;
    const precentage = (presentDays / totalDays) * 100;
    return(
        <div className="">
                <h1 className="text-xl font-semibold">{precentage || "-"}%</h1>
                <span className="text-sm text-gray-400">Attendance</span>
            </div>
    )
}


export default StudentAttendanceCard