import { auth, getAuth } from "@clerk/nextjs/server";

// const { userId,sessionClaims } =await getAuth();
// export const role = (sessionClaims?.metadata as {role?: string })?.role;
// export const currentUserId = userId;


const currentWorkWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);

    if (dayOfWeek === 0) {
        startOfWeek.setDate(today.getDate())
    }

    if (dayOfWeek === 6) {
        startOfWeek.setDate(today.getDate() + 1);
    } else {
        startOfWeek.setDate(today.getDate() - (dayOfWeek))
    }
startOfWeek.setHours(0,0,0,0);




return startOfWeek ;
}

export const adjustScheduleToCurrentWeek = (lessons:{title:string;start:Date;end:Date}[]):{title:string;start:Date;end:Date}[]=>{
    const  startOfWeek = currentWorkWeek()
    return lessons.map(lesson =>{
        const lessonDayOfWeek = lesson.start.getDay();

        const daysFromSunday =lessonDayOfWeek ;

        const adjustedStartDate = new Date(startOfWeek);

        adjustedStartDate.setDate(startOfWeek.getDate() + daysFromSunday);
        adjustedStartDate.setHours(
            lesson.start.getHours(),
            lesson.start.getMinutes(),
            lesson.start.getSeconds()
        )
        
        const adjustedEndDate = new Date(adjustedStartDate);
        adjustedEndDate.setHours(
            lesson.end.getHours(),
            lesson.end.getMinutes(),
            lesson.end.getSeconds()
        )
        return{
            title: lesson.title,
            start: adjustedStartDate,
            end: adjustedEndDate,
        }

    })
}


