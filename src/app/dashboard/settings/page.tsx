import PromotionButton from "@/components/PromotionButton";
import SimulationButton from "@/components/SimulationButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image"; // سنستخدمها للأيقونة

const AdminSettingsPage = async () => {
  // تأمين الصفحة للمدير فقط
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        
        {/* قسم العنوان الرئيسي */}
        <div className="flex items-center gap-4 border-b-2 border-gray-100 pb-4 mb-6">
          <Image src="/promote.png" alt="ترقية" width={40} height={40} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">عمليات نهاية العام الدراسي</h1>
            <p className="text-sm text-gray-500">أداة ترفيع الطلاب، تحديث الحالات، وإعداد العام الدراسي الجديد.</p>
          </div>
        </div>

        {/* قسم التحذير */}
        <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-md mb-8">
          <h2 className="font-bold text-red-800">تحذير! عملية حساسة.</h2>
          <p className="text-red-700 text-sm mt-1">
            هذه العملية تقوم بتغييرات دائمة على بيانات كل الطلاب. يرجى عدم تنفيذها إلا بعد انتهاء العام الدراسي بالكامل والتأكد من رصد جميع النتائج.
          </p>
        </div>

        {/* قسم الخطوات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* الخطوة 1: التشغيل التجريبي */}
          <div className="bg-gray-50 p-6 rounded-lg border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-blue-700">الخطوة الأولى: التشغيل التجريبي (آمن)</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              هذا الزر لن يغير أي بيانات. وظيفته هي عرض تقرير مفصل يوضح حالة كل طالب المتوقعة (ناجح، راسب، أو متخرج) بناءً على نتائجه. استخدمه للمراجعة والتأكد من أن كل شيء صحيح.
            </p>
            <SimulationButton />
          </div>

          {/* الخطوة 2: التنفيذ الفعلي */}
          <div className="bg-gray-50 p-6 rounded-lg border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-3 text-red-700">الخطوة الثانية: التنفيذ الفعلي (نهائي)</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              فقط بعد مراجعة التقرير التجريبي والتأكد من صحته، استخدم هذا الزر لتطبيق التغييرات بشكل دائم على قاعدة البيانات. سيطلب منك كلمة المرور ك تأكيد أخير.
            </p>
            <PromotionButton />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;