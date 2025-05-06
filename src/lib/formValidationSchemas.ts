import { z } from "zod";

export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: 'اسم المادة مطلوب !' }),
    teachers: z.array(z.string()),
  });
   

export type SubjectSchema = z.infer<typeof subjectSchema>;


export const classSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: 'اسم المادة مطلوب !' }),
    capacity: z.coerce.number().min(1, { message: 'السعة مطلوبة !' }),
    gradeId: z.coerce.number().min(1, { message: 'الصف مطلوب !' }),
    supervisorId: z.coerce.string().optional(),

  });
   

export type ClassSchema = z.infer<typeof classSchema>;


export const teacherSchema = z.object({
    id: z.string().optional(),
    username: z.string().min(3, { message: 'username must be at least 3 characters long!' })
    .max(20, { message: 'username must be at most 20 characters long!' }),
    password: z.string().min(8, { message: 'password must be at least 8 characters long!' }).or(z.literal("")).optional(),
    name: z.string().min(1, { message: 'First name is required!' }),
    surname: z.string().min(1, { message: 'Last name is required!' }),
    email: z.string().email({message:"Invalid email address!"}).optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().min(1, { message: 'address is required!' }),
    img: z.string().optional(),
    bloodType: z.string().min(1, { message: 'Blood Type is required!' }),
    birthday: z.coerce.date({ message: 'birthday is required!' }),
    sex: z.enum(["MALE","FEMALE"],{message:"Sex is required"}),
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





export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});
 

export type ExamSchema = z.infer<typeof examSchema>;