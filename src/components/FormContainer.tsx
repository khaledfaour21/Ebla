import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import ResultForm from "./forms/ResultForm";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "library"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;

      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;

      case "parent":
        relatedData = {};
        break;

      case "exam":
        const examsLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: userId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examsLessons };
        break;

      // --------- أضف هذا الكيس للـ event ----------
      case "event":
        const eventClasses = await prisma.class.findMany({
          include: {
            _count: {
              select: { students: true },
            },
          },
        });
        relatedData = { classes: eventClasses };
        break;
      // --------------------------------------------
      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          include: {
            _count: {
              select: { students: true },
            },
          },
        });
        relatedData = { classes: announcementClasses };
        break;
      





        case "lesson":
  const lessonSubjects = await prisma.subject.findMany({
    select: { id: true, name: true },
  });
  const lessonClasses = await prisma.class.findMany({
    select: { id: true, name: true },
  });
  const lessonTeachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });
  relatedData = {
    subjects: lessonSubjects,
    classes: lessonClasses,
    teachers: lessonTeachers,
  };
  break;


  case "result":
  const resultStudents = await prisma.student.findMany()
  const resultLessons = await prisma.lesson.findMany({
    include: {
      subject: true,
      teacher: true,
    },
  });
  relatedData = {
    students: resultStudents,
    lessons: resultLessons,
  };
  break;

  case "library":
    relatedData = {};
    break;
    

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
