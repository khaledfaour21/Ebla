import Announcements from "@/components/Announcements"
import BigCalendarContainer from "@/components/BigCalendarContainer"
import { auth } from "@clerk/nextjs/server"


const TeacherPage =async () => {
    const { userId } =await auth();
    return (
        <div className="p-4 flex gap-4 flex-col xl:flex-row flex-1">
         {/*left */}
         <div className="w-full xl:w-1/3 flex flex-col gap-8">
         <Announcements/>
         </div>
         {/*right */}
         <div className="w-full xl:w-2/3">
         <div className="h-full bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold text-right p-2">البرنامج</h1>
            <BigCalendarContainer type="teacherId" id={userId!} />
         </div>

         </div>

        </div>
    )
}

export default TeacherPage;