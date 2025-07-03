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
      return new Response("غير مصرح به", { status: 401 });
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    let systemPrompt = "";
    let dynamicContext = "";
    let isDataRequest = false; 

    // Logic to decide which special task to perform
    if (role === 'admin' && lastMessage.includes("تحليل الطالب")) {
        isDataRequest = true;
        systemPrompt = "أنت مستشار أكاديمي خبير. قدم تحليلاً مفصلاً وموضوعياً لعلامات الطالب مع نصائح واضحة.";
        const studentFullName = lastMessage.replace("تحليل الطالب:", "").trim();
        const nameParts = studentFullName.split(' ');
        const student = await prisma.student.findFirst({
            where: { AND: [ { name: { contains: nameParts[0] } }, { surname: { contains: nameParts.length > 1 ? nameParts.slice(1).join(' ') : "" } } ]},
            include: { results: { where: { term: "SECOND" }, include: { lesson: { include: { subject: true } } } } }
        });
        if (student && student.results.length > 0) {
            dynamicContext = `نتائج الطالب "${student.name} ${student.surname}" هي:\n` + student.results.map(r => `- مادة ${r.lesson?.subject?.name ?? 'غير معروفة'}: ${r.total ?? 0}/${r.lesson?.subject?.maxMark ?? 100}`).join("\n");
        } else {
            dynamicContext = `لم يتم العثور على طالب بالاسم "${studentFullName}" أو لا توجد لديه نتائج مسجلة.`;
        }
    } else if (role === 'admin' && lastMessage.includes("إحصائيات")) {
        isDataRequest = true;
        systemPrompt = "أنت محلل بيانات لمدرسة. قدم للمدير إحصائيات دقيقة وموجزة عن المدرسة.";
        const [studentCount, teacherCount, classCount] = await prisma.$transaction([prisma.student.count(), prisma.teacher.count(), prisma.class.count()]);
        dynamicContext = `إحصائيات المدرسة الحالية:\n- عدد الطلاب: ${studentCount}\n- عدد المدرسين: ${teacherCount}\n- عدد الشعب: ${classCount}`;
    }
    // You can add more "else if" blocks here for other roles like student, parent, etc.

    let finalPrompt;

    if (isDataRequest) {
      // Prompt for data analysis requests
      finalPrompt = `${systemPrompt}\n\nالبيانات:\n${dynamicContext}\n\nبناءً على ما سبق، أجب على طلب المستخدم التالي: "${lastMessage}"`;
    } else {
      // Prompt for general conversation
      const schoolInfo = `
        اسم المدرسة: مدرسة إيبلا
        فترة التسجيل: من شهر آب حتى منتصف أيلول.
        الأوراق المطلوبة: شهادة ميلاد، دفتر عائلة، و 4 صور شخصية.
      `;
      systemPrompt = `أنت مساعد ذكي ومتعاون لمدرسة إيبلا. هدفك الأساسي هو الإجابة على الأسئلة. إذا كان السؤال يبدو متعلقاً بالمدرسة، حاول استخدام "معلومات المدرسة" المتاحة. لأي سؤال عام آخر، استخدم معرفتك العامة لتقديم أفضل إجابة ممكنة. كن دائماً مهذباً وإيجابياً. إجاباتك يجب أن تكون بالعربية.`;
      finalPrompt = `${systemPrompt}\n\nمعلومات المدرسة للمرجع:\n---\n${schoolInfo}\n---\n\nسؤال المستخدم: "${lastMessage}"`;
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