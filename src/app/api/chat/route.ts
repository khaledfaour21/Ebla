import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    let systemPrompt = "";
    let dynamicContext = "";
    let useGeneralMode = false; // Flag to decide which mode to use

    // Logic to decide which special task to perform
    if (role === 'student' && lastMessage.includes("حلل")) {
        systemPrompt = "أنت مستشار أكاديمي. حلل بيانات الطالب وقدم له نصائح.";
        const studentResults = await prisma.result.findMany({ where: { studentId: userId }, include: { lesson: { include: { subject: true } } } });
        dynamicContext = "نتائج الطالب هي:\n" + studentResults.map(r => `- ${r.lesson?.subject?.name ?? ''}: ${r.total ?? 0}/${r.lesson?.subject?.maxMark ?? 100}`).join("\n");
    } else if (role === 'parent' && lastMessage.includes("أبنائي")) {
        systemPrompt = "أنت مرشد تربوي. قدم لولي الأمر ملخصاً عن أداء أبنائه.";
        const children = await prisma.student.findMany({ where: { parentId: userId }, include: { results: { include: { lesson: { include: { subject: true } } } } } });
        dynamicContext = "أداء أبنائك هو:\n" + children.map(child => `\nالطالب ${child.name}:\n` + child.results.map(r => `- ${r.lesson?.subject?.name ?? ''}: ${r.total ?? 0}/${r.lesson?.subject?.maxMark ?? 100}`).join("\n")).join("\n");
    } else if (role === 'teacher' && lastMessage.includes("طلابي")) {
        systemPrompt = "أنت مساعد تدريس. قدم للمعلم تحليلاً لأداء طلابه.";
        const teacherResults = await prisma.result.findMany({ where: { lesson: { teacherId: userId } }, include: { student: true, lesson: { include: { subject: true } } } });
        dynamicContext = "أداء طلابك هو:\n" + teacherResults.map(r => `- الطالب ${r.student.name} في مادة ${r.lesson?.subject?.name ?? ''}: ${r.total ?? 0}/${r.lesson?.subject?.maxMark ?? 100}`).join("\n");
    } else if (role === 'admin' && lastMessage.includes("تحليل الطالب")) {
        systemPrompt = "أنت مستشار أكاديمي خبير. قدم تحليلاً مفصلاً.";
        const studentFullName = lastMessage.replace("تحليل الطالب:", "").trim();
        const nameParts = studentFullName.split(' ');
        const student = await prisma.student.findFirst({ where: { AND: [ { name: { contains: nameParts[0] } }, { surname: { contains: nameParts.length > 1 ? nameParts.slice(1).join(' ') : "" } } ]}, include: { results: { where: { term: "SECOND" }, include: { lesson: { include: { subject: true } } } } } });
        if (student) {
            dynamicContext = `نتائج الطالب "${student.name} ${student.surname}" هي:\n` + student.results.map(r => `- مادة ${r.lesson?.subject?.name ?? ''}: ${r.total ?? 0}/${r.lesson?.subject?.maxMark ?? 100}`).join("\n");
        } else {
            dynamicContext = `لم يتم العثور على طالب بالاسم "${studentFullName}".`;
        }
    } else if (role === 'admin' && lastMessage.includes("إحصائيات")) {
        systemPrompt = "أنت محلل بيانات. قدم للمدير إحصائيات دقيقة.";
        const [studentCount, teacherCount, classCount] = await prisma.$transaction([prisma.student.count(), prisma.teacher.count(), prisma.class.count()]);
        dynamicContext = `إحصائيات المدرسة:\n- عدد الطلاب: ${studentCount}\n- عدد المدرسين: ${teacherCount}\n- عدد الشعب: ${classCount}`;
    } else {
        // If no special command is found, use the general mode
        useGeneralMode = true;
    }

    let finalPrompt;
    if (useGeneralMode) {
      // --- This is the new, flexible prompt for general questions ---
      systemPrompt = `أنت مساعد ذكي ومتعاون. هدفك هو الإجابة على أسئلة المستخدم بتقديم أفضل إجابة ممكنة باستخدام معرفتك العامة. كن دائماً مهذباً وإيجابياً. يجب أن تكون كل إجاباتك باللغة العربية.`;
      finalPrompt = `${systemPrompt}\n\nسؤال المستخدم: "${lastMessage}"`;
    } else {
      // This is for data-driven analysis
      finalPrompt = `${systemPrompt}\n\nالبيانات:\n${dynamicContext}\n\nبناءً على ما سبق، أجب على طلب المستخدم التالي: "${lastMessage}"`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }]
    });

    const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) { controller.enqueue(encoder.encode(text)); }
          }
          controller.close();
        },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error) {
    console.error("API Route Error:", error);
    return new Response("An error occurred.", { status: 500 });
  }
}