import Announcements from "@/components/Announcements"
import BigCalendar from "@/components/BigCalendar"


const ParentPage = () => {
    return (
        <div className="p-4 flex gap-4 flex-col xl:flex-row flex-1">
         {/*left */}
         <div className="w-full xl:w-1/3 flex flex-col gap-8">
         
         <Announcements/>
         </div>





         {/*right */}
         <div className="w-full xl:w-2/3">
         <div className="h-full bg-white p-4 rounded -md">
            <h1 className="text-xl font-semibold text-right p-2">البرنامج(john)</h1>
            <BigCalendar/>
         </div>
         </div>

        </div>
    )
}

export default ParentPage