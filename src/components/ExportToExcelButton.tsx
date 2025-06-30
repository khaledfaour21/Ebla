// في components/ExportToExcelButton.tsx

"use client";

// هذا المكون يستقبل البيانات ويقوم بتصديرها
const ExportToExcelButton = ({ data }: { data: any[] }) => {

  const handleExport = () => {
    // التأكد من وجود بيانات
    if (!data || data.length === 0) {
      alert("لا توجد بيانات لتصديرها.");
      return;
    }

    // 1. تحديد رؤوس الأعمدة (باللغة العربية لتكون واضحة في Excel)
    const headers = [
      "اسم الطالب", "اسم المادة", "اسم الأستاذ",
      "مذاكرة 1", "مذاكرة 2", "وظائف", "شفهي", "نهائي", "المجموع", "ملاحظات"
    ];

    // 2. تحويل البيانات إلى صفوف CSV
    const csvRows = [
      headers.join(','), // إضافة سطر العناوين
      ...data.map(row => {
        // استخراج البيانات بالترتيب الصحيح
        const rowData = [
          `"${row.student.name} ${row.student.surname}"`, // وضعنا الاسم بين "" لتجنب المشاكل
          `"${row.lesson?.subject?.name ?? ''}"`,
          `"${row.lesson?.teacher?.name ?? ''}"`,
          row.quiz1 ?? '',
          row.quiz2 ?? '',
          row.homework ?? '',
          row.oral ?? '',
          row.final ?? '',
          row.total ?? '',
          `"${row.note ?? ''}"`,
        ];
        return rowData.join(',');
      })
    ];

    // 3. إنشاء ملف CSV وتنزيله
    const csvContent = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF لدعم اللغة العربية في Excel
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'student_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 text-white p-2 rounded-md text-sm hover:bg-green-700 transition-colors"
    >
      تصدير إلى Excel 
    </button>
  );
};

export default ExportToExcelButton;