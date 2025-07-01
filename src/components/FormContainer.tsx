import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import DeleteForm from "./forms/DeleteForm";

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
  if (type === "delete") {
    return <DeleteForm table={table} id={id} />;
  }

  let relatedData = {};
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  switch (table) {
    case "subject":
      const teachers = await prisma.teacher.findMany({
        select: { id: true, name: true, surname: true },
      });
      relatedData = { teachers };
      break;

    case "class":
      const grades = await prisma.grade.findMany({
        select: { id: true, level: true },
      });
      const supervisors = await prisma.teacher.findMany({
        select: { id: true, name: true, surname: true },
      });
      relatedData = { grades, supervisors };
      break;

    case "teacher":
      const subjects = await prisma.subject.findMany({
        select: { id: true, name: true },
      });
      relatedData = { subjects };
      break;

    case "student":
      const [studentGrades, studentClasses, studentParents] =
        await prisma.$transaction([
          prisma.grade.findMany({ select: { id: true, level: true } }),
          prisma.class.findMany({
            include: { _count: { select: { students: true } } },
          }),
          prisma.parent.findMany({
            select: { id: true, name: true, surname: true },
          }),
        ]);
      relatedData = {
        grades: studentGrades,
        classes: studentClasses,
        parents: studentParents,
      };
      break;

    case "lesson":
      const [lessonSubjects, lessonClasses, lessonTeachers] =
        await prisma.$transaction([
          prisma.subject.findMany(),
          prisma.class.findMany(),
          prisma.teacher.findMany(),
        ]);
      relatedData = {
        subjects: lessonSubjects,
        classes: lessonClasses,
        teachers: lessonTeachers,
      };
      break;

    case "exam":
    case "assignment":
      const lessons = await prisma.lesson.findMany({
        where: { ...(role === "teacher" ? { teacherId: userId! } : {}) },
        include: { subject: true, class: true },
      });
      relatedData = { lessons };
      break;

    case "result":
      const [resultStudents, resultLessons] = await prisma.$transaction([
        prisma.student.findMany(),
        prisma.lesson.findMany({ include: { subject: true } }),
      ]);
      relatedData = { students: resultStudents, lessons: resultLessons };
      break;

    case "announcement":
    case "event":
      relatedData = { classes: await prisma.class.findMany() };
      break;

    default:
      relatedData = {};
      break;
  }

  return (
    <FormModal
      table={table}
      type={type}
      data={data}
      id={id}
      relatedData={relatedData}
    />
  );
};

export default FormContainer;
