// في ملف app/dashboard/about/page.tsx

import Image from "next/image";

const AboutPage = () => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md m-4" dir="rtl">
      {/* --- القسم العلوي يبقى كما هو --- */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="flex-shrink-0">
          <Image
            src="/schoollogo.jpg"
            alt="شعار المدرسة"
            width={150}
            height={150}
            className="rounded-full border-4 border-gray-200"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800 text-right">
            عن مدرسة إيـــبـــلا (Ebla School)
          </h1>
          <p className="text-lg text-gray-600 mt-2 text-right">
            رواد التعليم الرقمي وصناع المستقبل.
          </p>
        </div>
      </div>

      <div className="space-y-8 text-right">
        <div>
          <h2 className="text-2xl font-semibold text-Purple border-b-2 border-Purple pb-2 mb-4">
            رسالتنا
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            مهمتنا هي توفير بيئة تعليمية آمنة ومحفزة باستخدام أحدث التقنيات
            لتنمية قدرات طلابنا الأكاديمية والشخصية، وإعداد جيل واعٍ ومبدع قادر
            على مواجهة تحديات المستقبل.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-Sky border-b-2 border-Sky pb-2 mb-4">
            رؤيتنا
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            أن نكون المدرسة الرائدة في تقديم تعليم عالي الجودة يدمج بين الأصالة
            والمعاصرة، ونخرج قادة ومبتكرين يساهمون بفعالية في تطور مجتمعهم.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-Yellow border-b-2 border-Yellow pb-2 mb-4">
            حول المبرمج
          </h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            انا الطالب خالد فاعور. انشأت هذا التطبيق من أجل مشروعي التخرج الذي
            سوف يمكنني من نيل إجازة في كلية الهندسة قسم المعلوماتية والإتصالات
            في جامعة إيبلا الخاصة.
          </p>
        </div>
      </div>

      {/* --- هذا هو القسم الجديد الذي تمت إضافته --- */}
      <div className="mt-12 border-t-2 border-gray-100 pt-8">
        <div className="grid md:grid-cols-2 gap-10 text-right">
          {/* قسم تواصل معنا */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              تواصل معنا
            </h2>
            <p className="text-gray-600 mb-4">
              لأية استفسارات أو للحصول على معلومات إضافية، يمكنكم التواصل معنا
              مباشرة عبر واتساب.
            </p>
            <a
              href="https://wa.me/963941417211" // 👈 ضع رقم الواتساب الصحيح هنا (بدون + أو 00)
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
            >
              <Image
                src="/whatsapp.png"
                alt="WhatsApp"
                width={24}
                height={24}
              />
              <span>تواصل معنا على واتساب</span>
            </a>
          </div>

          {/* قسم تابعنا على */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              تابعنا على
            </h2>
            <p className="text-gray-600 mb-4">
              ابقى على إطلاع بآخر أخبار وفعاليات المدرسة عبر صفحاتنا على مواقع
              التواصل الاجتماعي.
            </p>
            <div className="flex justify-end items-center gap-6">
              <a
                href="https://www.instagram.com/khaled_faour.1?igsh=MW00aGkxYTU2YWd1dg==" // 👈 ضع رابط صفحة الانستغرام هنا
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 hover:scale-110"
              >
                <Image
                  src="/instgram.png"
                  alt="Instagram"
                  width={40}
                  height={40}
                />
              </a>
              <a
                href="https://www.facebook.com/share/15F4M8gpij/" // 👈 ضع رابط صفحة الفيسبوك هنا
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 hover:scale-110"
              >
                <Image
                  src="/facebook.png"
                  alt="Facebook"
                  width={40}
                  height={40}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* --- نهاية القسم الجديد --- */}
    </div>
  );
};

export default AboutPage;
