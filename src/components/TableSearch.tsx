"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

const TableSearch = () => {
 
    const router = useRouter()
    const handleSubmit = (e:React.FormEvent<HTMLFormElement>) =>{

        e.preventDefault();

        const value = (e.currentTarget[0] as HTMLInputElement).value;

        const params = new URLSearchParams(window.location.search)
        params.set("search",value)
        router.push(`${window.location.pathname}?${params}`);
    }

    return (
       <form onSubmit={handleSubmit} className="w-full md:w-auto flex items-center justify-start gap-2 text-xs rounded-full  ring-[1.5px] ring-gray-300 px-2  relative">
                  
                <Image src="/search.png" alt="" width={14} height={14} className="absolute left-2"/>
                <input type="text" placeholder="إبحث هنا ..." className="w-[200px] p-2 bg-transparent outline-none text-right"style={{ direction:"rtl"}}/>
                  
                </form>
    )
}

export default TableSearch