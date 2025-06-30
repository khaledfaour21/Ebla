"use client";

import { Calendar, momentLocalizer, View } from "react-big-calendar"; // 👈 تأكد من استيراد View
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo, useState } from "react"; // 👈 تأكد من استيراد useState

// إعدادات اللغة الإنجليزية مع بداية الأسبوع من الأحد
moment.updateLocale("en", {
  week: {
    dow: 0, // 0 = Sunday
  },
});

const localizer = momentLocalizer(moment);

type SerializableEvent = {
  title: string;
  start: string; 
  end: string;
}

const BigCalendar = ({ data: serializableData }: { data: SerializableEvent[] }) => {

  // --- هذا هو الإصلاح: نضيف State للتحكم في العرض ---
  const [view, setView] = useState<View>('week');
  // ----------------------------------------------------

  const events = useMemo(() => serializableData.map(event => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  })), [serializableData]);

  const dayPropGetter = (date: Date) => {
    const day = date.getDay();
    if (day === 5 || day === 6) {
      return { className: 'rbc-day-hidden' };
    }
    return {};
  };

  const { components, formats } = useMemo(
    () => ({
      components: {
        header: ({ date }: { date: Date }) => (
          <span>{moment(date).format('ddd')}</span>
        ),
        event: ({ event }: { event: { title: string } }) => (
          <span><strong>{event.title}</strong></span>
        ),
      },
      formats: {
        timeGutterFormat: 'h:mm A',
        eventTimeRangeFormat: () => "",
      },
    }),
    []
  );

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: "98%" }}
      dayPropGetter={dayPropGetter}
      components={components}
      formats={formats}
      min={new Date(0, 0, 0, 8, 0, 0)}
      max={new Date(0, 0, 0, 16, 0, 0)}
      rtl={true}
      
      // --- هنا نخبر التقويم بكيفية التعامل مع الأزرار ---
      views={['week', 'day']}
      view={view} // نربط العرض بالـ state
      onView={(view) => setView(view)} // عند الضغط على زر، نحدّث الـ state
    />
  );
};

export default BigCalendar;