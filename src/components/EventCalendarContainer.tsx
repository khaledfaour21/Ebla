import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import Link from "next/link";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = await searchParams;

  return (
    <div className="bg-white p-4 rounded-md ">
      <EventCalendar />
      <div className="flex items-center justify-between">
      <Link
          href="/dashboard/list/events"
          className="text-xs text-gray-400 hover:text-yellow-600"
        >
          استعراض الكل
        </Link>        <h1 className="text-xl font-semibold my-4">الأحداث</h1>
      </div>
      <div className="flex flex-col gap-4">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
