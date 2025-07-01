"use server";

import { revalidatePath } from "next/cache";
import {
  AssignmentSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  LibrarySchema,
  ParentSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { auth, createClerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

const clerkClient = await createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  
});
const verifyAdminPermission = async () => {
  const { sessionClaims } = await auth();
  const userRole = (sessionClaims?.metadata as { role?: string })?.role;
  if (userRole !== "admin") {
    throw new Error("ACCESS_DENIED: أنت غير مخول للقيام بهذه العملية.");
  }
};

// في ملف lib/actions.ts

// ... (imports and other actions)

// هذه الدالة ستقوم بحذف عنصر من أي جدول
export const deleteItem = async (currentState: any, formData: FormData) => {
  // تأكد من وجود دالة التحقق من صلاحيات المدير لديك
  // await verifyAdminPermission(); 

  const id = formData.get("id") as string;
  const table = formData.get("table") as string;

  if (!id || !table) {
    return { success: false, error: true, message: "بيانات الحذف ناقصة." };
  }

  try {
    // استخدام Prisma لحذف العنصر من الجدول المحدد ديناميكياً
    await (prisma as any)[table].delete({
      where: { id: Number.isInteger(parseInt(id)) ? parseInt(id) : id },
    });

    revalidatePath(`/dashboard/list/${table}s`);
    return { success: true, error: false, message: "تم الحذف بنجاح" };
  } catch (err: any) {
    // في حال كان العنصر مرتبطاً ببيانات أخرى (مثل طالب له نتائج) سيمنع الحذف
    if (err.code === 'P2003') {
        return { success: false, error: true, message: "لا يمكن حذف هذا العنصر لأنه مرتبط ببيانات أخرى." };
    }
    return { success: false, error: true, message: "فشل الحذف." };
  }
};
// أضف هذه الدالة الجديدة في ملف actions.ts

export const simulatePromoteStudents = async () => {
  "use server";
  try {
    // لا حاجة للتحقق من صلاحيات المدير في التشغيل التجريبي
    // await verifyAdminPermission();

    const studentsToProcess = await prisma.student.findMany({
      where: {
        status: 'ACTIVE',
        grade: {
          level: { in: [1, 2, 3, 4, 5, 6] }
        }
      },
      include: {
        grade: true,
        results: {
          where: { term: 'SECOND' },
          include: {
            lesson: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    const reportLines = []; // سنجمع النتائج هنا بدلاً من تنفيذها

    for (const student of studentsToProcess) {
      const hasResults = student.results && student.results.length > 0;
      const hasPassedAllSubjects = hasResults && student.results.every(result => {
        if (!result.lesson?.subject?.maxMark) return false;
        const passingScore = result.lesson.subject.maxMark * 0.40;
        const studentScore = parseInt(result.total || "0");
        return studentScore >= passingScore;
      });

      const studentIdentifier = `${student.name} ${student.surname} (الصف ${student.grade.level})`;

      if (hasPassedAllSubjects) {
        if (student.grade.level === 6) {
          reportLines.push(`✅ ${studentIdentifier} -> ناجح وسيتم تخرجه.`);
        } else {
          reportLines.push(`⬆️ ${studentIdentifier} -> ناجح وسيتم ترفيعه إلى الصف ${student.grade.level + 1}.`);
        }
      } else {
        reportLines.push(`🔁 ${studentIdentifier} -> لم ينجح وسيعيد السنة.`);
      }
    }

    if(reportLines.length === 0){
        return { success: true, message: "لم يتم العثور على طلاب نشطين للمعالجة." };
    }

    // إرجاع التقرير كنص
    return { success: true, message: "تقرير التشغيل التجريبي:\n\n" + reportLines.join('\n') };

  } catch (err: any) {
    return { success: false, message: `حدث خطأ: ${err.message}` };
  }
};
// في ملف actions.ts

// ... (تأكد من وجود verifyAdminPermission)

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await verifyAdminPermission();
    await prisma.subject.create({
      data: {
        name: data.name,
        maxMark: data.maxMark,
        teachers: {
          connect: data.teachers.map((id) => ({ id: id })),
        },
      },
    });
    revalidatePath("/dashboard/list/subjects");
    // أضفنا message هنا
    return { success: true, error: false, message: "تمت إضافة المادة بنجاح." };
  } catch (err: any) {
    console.log(err);
    // أضفنا message هنا
    return { success: false, error: true, message: err.message };
  }
};

// في ملف actions.ts
export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema & { id: number }
) => {
  // --- هذا الشرط مهم جداً ---
  if (!data.id) {
    return { success: false, error: true, message: "ID المادة مفقود، لا يمكن التحديث." };
  }
  // -------------------------

  try {
    await verifyAdminPermission();
    
    await prisma.subject.update({
      where: { id: data.id }, // الآن data.id مضمونة
      data: {
        name: data.name,
        maxMark: data.maxMark,
        teachers: {
          set: (data.teachers || []).map((id) => ({ id: id })),
        },
      },
    });

    revalidatePath("/dashboard/list/subjects");
    return { success: true, error: false, message: "تم تعديل المادة بنجاح." };
  } catch (err: any) {
    return { success: false, error: true, message: err.message };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        //...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        //...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};











export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone ?? "",
        address: data.address,
        createdAt: new Date(),
      },
    });

    // revalidatePath("/list/parents"); // عدل المسار حسب الحاجة
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,

    });

    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    // revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  if (!id) {
    return { success: false, error: true, message: "Missing id" };
  }
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};







export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema,
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};



export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


























export const createEvent = async (
  currentState: any,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ?? undefined,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Event Error:", error);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: any,
  data: EventSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Missing id for update" };
  }
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ?? undefined,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Update Event Error:", error);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: any,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || typeof id !== "string") {
    return { success: false, error: true, message: "Invalid or missing id" };
  }
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return { success: false, error: true, message: "Invalid id format" };
  }
  try {
    await prisma.event.delete({
      where: { id: parsedId },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Delete Event Error:", error);
    return { success: false, error: true };
  }
};




















export const createAnnouncement = async (
  currentState: any,
  data: {
    title: string;
    description: string;
    date: Date;
    classId?: number;
  }
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? undefined,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Create Announcement Error:", error);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: any,
  data: {
    id: number;
    title: string;
    description: string;
    date: Date;
    classId?: number;
  }
) => {
  if (!data.id) {
    return { success: false, error: true, message: "Missing id for update" };
  }
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? undefined,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Update Announcement Error:", error);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: any,
  data: FormData
) => {
  const id = data.get("id");
  if (!id || typeof id !== "string") {
    return { success: false, error: true, message: "Invalid or missing id" };
  }
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return { success: false, error: true, message: "Invalid id format" };
  }
  try {
    await prisma.announcement.delete({
      where: { id: parsedId },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Delete Announcement Error:", error);
    return { success: false, error: true };
  }
};

























export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    // ببساطة قم بتمرير البيانات كما هي. لا حاجة لإعادة تعريف الحقول.
    await prisma.lesson.create({
      data: data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


// --- الدالة المعدلة لتحديث درس ---
export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    // من الأفضل فصل الـ id عن باقي البيانات عند التحديث
    const { id, ...restOfData } = data;
    
    await prisma.lesson.update({
      where: { id: id },
      data: restOfData, // نمرر باقي البيانات هنا
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};












type currentState = { success: boolean; error: boolean }

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        term: data.term,
        quiz1: data.quiz1,
        quiz2: data.quiz2,
        oral: data.oral,
        homework: data.homework,
        final:data.final,
        total: data.total,
        note: data.note ?? "",
      },
    })
    revalidatePath("/dashboard/list/results")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) return { success: false, error: true }
  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        term: data.term,
        quiz1: data.quiz1,
        quiz2: data.quiz2,
        oral: data.oral,
        homework: data.homework,
        final:data.final,
        total: data.total,
        note: data.note ?? "",
      },
    })
    revalidatePath("/dashboard/list/results")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}


export const deleteResult = async (
  currentState: { success: boolean; error: boolean },
  data: FormData
) => {
  const id = data.get("id");
  if (!id || typeof id !== "string") {
    return { success: false, error: true };
  }

  try {
    await prisma.result.delete({
      where: { id: parseInt(id, 10) },
    });

    revalidatePath("/dashboard/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};





export const createLibrary = async (
  currentState: { success: boolean; error: boolean },
  data: LibrarySchema
) => {
  try {
    await prisma.library.create({ data })
    revalidatePath("/dashboard/list/library")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const updateLibrary = async (
  currentState: { success: boolean; error: boolean },
  data: LibrarySchema & { id: number }
) => {
  try {
    await prisma.library.update({
      where: { id: data.id },
      data,
    })
    revalidatePath("/dashboard/list/library")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}

export const deleteLibrary = async (
  currentState: { success: boolean; error: boolean },
  formData: FormData
) => {
  const id = formData.get("id")
  if (!id || typeof id !== "string") return { success: false, error: true }

  try {
    await prisma.library.delete({
      where: { id: parseInt(id) },
    })
    revalidatePath("/dashboard/list/library")
    return { success: true, error: false }
  } catch (err) {
    console.log(err)
    return { success: false, error: true }
  }
}














export const promoteStudentsEndOfYear = async () => {
  "use server";
  try {
    // هذا يفترض وجود دالة للتحقق من صلاحيات المدير
    // await verifyAdminPermission(); 

    const studentsToProcess = await prisma.student.findMany({
      where: {
        status: 'ACTIVE',
        grade: {
          level: { in: [1, 2, 3, 4, 5, 6] }
        }
      },
      include: {
        grade: true,
        results: {
          where: { term: 'SECOND' },
          include: {
            lesson: {
              include: {
                subject: true 
              }
            }
          }
        }
      }
    });

    const grades = await prisma.grade.findMany();
    const gradeMap = new Map<number, number>();
    grades.forEach(g => gradeMap.set(g.level, g.id));
    
    const updates = [];

    for (const student of studentsToProcess) {
      const hasResults = student.results && student.results.length > 0;
      
      const hasPassedAllSubjects = hasResults && student.results.every(result => {
        // --- هذا هو الإصلاح ---
        // إذا كانت النتيجة غير مرتبطة بشكل صحيح بمادة لديها علامة عظمى،
        // نعتبر الطالب راسباً في هذه المادة كإجراء وقائي.
        if (!result.lesson?.subject?.maxMark) {
          return false; 
        }
        // --- نهاية الإصلاح ---
        
        const passingScore = result.lesson.subject.maxMark * 0.40;
        const studentScore = parseInt(result.total || "0");
        
        return studentScore >= passingScore;
      });

      if (hasPassedAllSubjects) {
        if (student.grade.level === 6) {
          // تخرج الطالب
          updates.push(prisma.student.update({
            where: { id: student.id },
            data: { status: 'GRADUATED', classId: null }
          }));
        } else {
          // ترفيع الطالب
          const nextGradeId = gradeMap.get(student.grade.level + 1);
          if (nextGradeId) {
            updates.push(prisma.student.update({
              where: { id: student.id },
              data: { 
                gradeId: nextGradeId, 
                classId: null 
              } 
            }));
          }
        }
      } else {
        // تحديد الطالب كمعيد للسنة
        updates.push(prisma.student.update({
          where: { id: student.id },
          data: { 
            status: 'REPEATING', 
            classId: null 
          }
        }));
      }
    }

    await prisma.$transaction(updates);

    revalidatePath("/dashboard/list/students");
    return { success: true, message: `تمت معالجة ${updates.length} طالباً بنجاح.` };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
};















export const verifyPasswordAndPromoteStudents = async (password: string) => {
  "use server";
  
  const { userId } =await auth();
  if (!userId) {
    return { success: false, message: "المستخدم غير مسجل الدخول." };
  }

  try {
    // 1. التحقق من كلمة المرور باستخدام Clerk
    const result = await clerkClient.users.verifyPassword({
      userId,
      password,
    });

    if (result.verified) {
      // 2. إذا كانت كلمة المرور صحيحة، قم بتشغيل دالة الترفيع
      console.log("Password verified. Starting promotion process...");
      return await promoteStudentsEndOfYear();
    } else {
      return { success: false, message: "كلمة المرور غير صحيحة." };
    }
  } catch (err: any) {
    console.error("Verification Error:", err);
    // Clerk يرسل خطأ إذا كانت كلمة المرور خاطئة، لذلك نلتقطه هنا
    return { success: false, message: "كلمة المرور التي أدخلتها غير صحيحة." };
  }
};