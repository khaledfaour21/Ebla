import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "اسم المادة مطلوب !" }),
  maxMark: z.coerce.number().min(1, { message: "العلامة العظمى مطلوبة." }),
  teachers: z.array(z.string()),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "اسم المادة مطلوب !" }),
 

  capacity: z.coerce.number().min(1, { message: "السعة مطلوبة !" }),
  gradeId: z.coerce.number().min(1, { message: "الصف مطلوب !" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "username must be at least 3 characters long!" })
    .max(20, { message: "username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "password must be at least 8 characters long!" })
    .or(z.literal(""))
    .optional(),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "address is required!" }),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required" }),
  subjects: z.array(z.string()).optional(),
});

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const ParentSchema = z.object({
  id: z.string().optional(), // لأن الـ id في Prisma هو String وممكن يكون موجود أو لا عند الإنشاء
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")), // تسمح بالكلمة الفارغة عند التحديث مثلاً
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "Address is required!" }),
  createdAt: z.date().optional(), // عادة يتم توليدها تلقائياً، لكن ممكن تكون موجودة
});

export type ParentSchema = z.infer<typeof ParentSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(), // لأن id تلقائي الزيادة، اختياري عند الإنشاء
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z
    .string()
    .min(1, { message: "Start time is required!" })
    .transform((val) => new Date(val)),
  endTime: z
    .string()
    .min(1, { message: "End time is required!" })
    .transform((val) => new Date(val)),
  classId: z
    .union([z.string().min(1), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.string().min(1, { message: "Date is required!" }), // تأكد من وجود هذا الحقل
  classId: z
    .union([z.string().min(1), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "اسم الحصة مطلوب!" }),
  // قمت بإضافة يومي السبت والأحد للاحتياط
  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  // استخدمنا regex للتحقق من صيغة الوقت HH:MM
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "صيغة الوقت غير صحيحة. استخدم HH:MM",
  }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "صيغة الوقت غير صحيحة. استخدم HH:MM",
  }),
  subjectId: z.coerce.number().min(1, { message: "المادة مطلوبة!" }),
  classId: z.coerce.number().min(1, { message: "الصف مطلوب!" }),
  teacherId: z.string().min(1, { message: "المعلم مطلوب!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

// أضف هذا المخطط إلى ملفك
export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "يجب اختيار طالب." }),
  lessonId: z.coerce.number().min(1, { message: "يجب اختيار درس." }),
  term: z.enum(["FIRST", "SECOND"]),
  quiz1: z.string().optional(),
  quiz2: z.string().optional(),
  oral: z.string().optional(),
  homework: z.string().optional(),
  final: z.string().optional(),
  total: z.string().optional(),
  note: z.string().optional(),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const librarySchema = z.object({
  title: z.string().min(1, "الاسم مطلوب"),
  grade: z.string().min(1, "السنة الدراسية مطلوبة"),
  link: z.string().url("يجب أن يكون رابط صحيح"),
  description: z.string().min(1, "الوصف مطلوب"),
  image: z.string().optional(),
});

export type LibrarySchema = z.infer<typeof librarySchema>;
