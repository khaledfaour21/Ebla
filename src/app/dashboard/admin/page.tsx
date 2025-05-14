import Announcements from "@/components/Announcements"
import CountChartContainer from "@/components/CountChartContainer"
import CountChartTeachers from "@/components/CountChartTeachers"
import EventCalendarContainer from "@/components/EventCalendarContainer"
import FinanceChart from "@/components/FinanceChart"
import UserCard from "@/components/UserCard"

const AdminPage = ({searchParams}:{searchParams:{[keys:string]:string |undefined}}) => {

    return (
        <div className="p-4 flex gap-4 flex-col md:flex-row">
         {/* يسار*/}
         <div className="w-full lg:w-1/3 flex flex-col gap-8">
         <EventCalendarContainer searchParams={searchParams}/>
         <Announcements/>
         </div>




         {/*يمين */}
         <div className="w-full lg:w-2/3 flex flex-col gap-8">
         {/*User Cards*/}
         <div className="flex gap-4 justify-between flex-wrap">
            <UserCard type="مشرف"/>
            <UserCard type="مدرس"/>
            <UserCard type="طالب"/>
            <UserCard type="ولي أمر"/>
            
         </div>
         {/* middle chart*/}
         <div className="flex gap-4 flex-col lg:flex-row">
            {/*attendance chart */}
        
         {/*count chart */}
         <div className="w-full  h-[450px] ">
         <CountChartContainer/>
         </div>
         <div className="w-full  h-[450px] ">
        <CountChartTeachers/>
         </div>
         
         </div>
         {/*buttom chart */}
         <div className="w-full h-[500px]">
            <FinanceChart/>
         </div>


         </div>         

        </div>
    )
}

export default AdminPage