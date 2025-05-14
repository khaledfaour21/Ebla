import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";
import Link from "next/link";

const CountChartTeachers = async () => {
  // جلب عدد المدرسين حسب الجنس
  const data = await prisma.teacher.groupBy({
    by: ["sex"],
    _count: true,
  });

  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;

  const total = boys + girls;
  const boysPercent = total ? Math.round((boys / total) * 100) : 0;
  const girlsPercent = total ? Math.round((girls / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* Title */}
      <div className="flex justify-between items-center">
      <Link
          href="/dashboard/list/teachers"
          className="text-xs text-gray-400 hover:text-yellow-600"
        >
          استعراض الكل
        </Link>
        <h1 className="text-lg font-semibold">المدرسين</h1>
      </div>

      {/* Chart */}
      <CountChart boys={boys} girls={girls} />

      {/* Bottom */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-Sky rounded-full" />
          <h1 className="font-bold">{boys}</h1>
          <h2 className="text-xs text-gray-300">
            ذكور ({boysPercent}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-Yellow rounded-full" />
          <h1 className="font-bold">{girls}</h1>
          <h2 className="text-xs text-gray-300">
            إناث ({girlsPercent}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChartTeachers;
