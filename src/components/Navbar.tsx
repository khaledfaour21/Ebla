import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

const Navbar = async () => {
  const user = await currentUser();
  return (
    <div className="flex items-center justify-between p-4">
      {/* الايقونات والمستخدمين*/}
      <div className="flex items-center gap-6 justify-start mr-auto w-full">
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        <UserButton />

        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.firstName || user?.lastName
              ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
              : user?.username
              ? user.username
              : "اسم المستخدم غير متوفر"}
          </span>
          <span className="text-[10px] text-gray-500 text-center">
            {user?.publicMetadata.role as string}
          </span>
        </div>
        {/* <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                <Image src="/announcement.png" alt="" width={20} height={20}/>
                <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">1</div>
            </div> */}
        {/* <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
                <Image src="/message.png" alt="" width={20} height={20}/>
            </div> */}
      </div>
      {/* حقل البحث*/}
      {/* <div className="hidden md:flex items-center justify-end gap-2 text-xs rounded-full  ring-[1.5px] ring-gray-300 px-2  relative">
           
         <Image src="/search.png" alt="" width={14} height={14} className="absolute left-2"/>
         <input type="text" placeholder="إبحث هنا ..." className="w-[200px] p-2 bg-transparent outline-none text-right"style={{ direction:"rtl"}}/>
           
         </div> */}
    </div>
  );
};

export default Navbar;
