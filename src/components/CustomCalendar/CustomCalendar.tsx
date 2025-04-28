import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './CustomCalendar.module.scss';

interface CustomCalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  tileContent?: (props: { date: Date }) => React.ReactNode;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ value, onChange, tileContent }) => {
  return (
    <div className={styles.calendarWrapper}>
      <Calendar
        value={value}
        onChange={(date) => onChange(date as Date)}
        tileContent={tileContent}
        className={styles.calendar}
        formatShortWeekday={(locale, date) => 
          ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][date.getDay()]
        }
        tileClassName={({ date }) => {
          const today = new Date();
          if (date.toDateString() === today.toDateString()) {
            return styles.today;
          }
          return '';
        }}
        minDetail="month"
        maxDetail="month"
        showNeighboringMonth={false}
      />
    </div>
  );
};

export default CustomCalendar; 