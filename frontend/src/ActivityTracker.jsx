import React, { useEffect, useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isPast, isToday, startOfWeek, addDays } from 'date-fns';
import axios from 'axios';

const ActivityPopup = ({ date, onClose, onSave }) => {
  const [activityStatus, setActivityStatus] = useState(null);

  const handleSave = () => {
    onSave(date, activityStatus);
    onClose();
  };

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: '9999' }}>
      <h4>{format(date, 'MMMM dd, yyyy')}</h4>
      <div>
        <label>
          <input type="radio" name="activity" value="yes" onChange={() => setActivityStatus(true)} /> Yes
        </label>
        <label>
          <input type="radio" name="activity" value="no" onChange={() => setActivityStatus(false)} /> No
        </label>
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const Calendar = ({ activities, onSave }) => {
  const [popupDate, setPopupDate] = useState(null);
  const currentMonth = new Date();
  const prevMonth = new Date(currentMonth);
  prevMonth.setMonth(currentMonth.getMonth() - 1);
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(currentMonth.getMonth() + 1);

  const handleClick = (date) => {
    setPopupDate(date);
  };

  const handleClosePopup = () => {
    setPopupDate(null);
  };

  const renderCalendar = (month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = days[0].getDay();
    const blanks = Array(firstDayOfMonth).fill(null);
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div style={{ marginBottom: '20px' }}>
        <h3>{format(month, 'MMMM yyyy')}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {dayOfWeek.map((day, index) => (
            <div key={index} style={{ width: '30px', textAlign: 'center' }}>{day}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {blanks.map((blank, index) => <div key={index} style={{ width: '30px', height: '30px' }}></div>)}
          {days.map(day => {
            const activity = activities.find(act => format(new Date(act.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
            const color = activity ? (activity.activity_status ? 'green' : 'red') : 'gray';
            return (
              <div key={day} onClick={() => handleClick(day)} style={{ width: '30px', height: '30px', textAlign: 'center', backgroundColor: color, cursor: 'pointer' }}>
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderCalendar(prevMonth)}
      {renderCalendar(currentMonth)}
      {renderCalendar(nextMonth)}
      {popupDate && <ActivityPopup date={popupDate} onClose={handleClosePopup} onSave={(date, status) => {onSave(date, status); handleClosePopup();}} />}
    </div>
  );
};

const ActivityTracker = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date();
  const previousMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);

  useEffect(() => {
    const fetchData = async (month) => {
      const year = format(month, 'yyyy');
      const monthNumber = format(month, 'MM');
      const response = await axios.get(`/api/daily-activities/${year}/${monthNumber}`, {
        headers: {
          Authorization: 'Bearer your_jwt_token_here'
        }
      });
      return response.data;
    };

    const loadActivities = async () => {
    //   const [prevActivities, currActivities, nextActivities] = await Promise.all([
    //     fetchData(previousMonth),
    //     fetchData(currentMonth),
    //     fetchData(nextMonth)
    //   ]);
    const startDate = new Date(2024, 5, 1); // May 1, 2024
    const endDate = new Date(2024, 5, 30); // July 31, 2024
    const currActivities = []
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        currActivities.push({
          date: new Date(d),
          activity_status: Math.random() > 0.5 // Random yes/no
        });
      }

      const startDate1 = new Date(2024, 4, 1); // May 1, 2024
    const endDate1 = new Date(2024, 4, 31); // July 31, 2024
    const prevActivities = []
    for (let d = startDate1; d <= endDate1; d.setDate(d.getDate() + 1)) {
        prevActivities.push({
          date: new Date(d),
          activity_status: Math.random() > 0.5 // Random yes/no
        });
      }

      const startDate2 = new Date(2024, 6, 1); // May 1, 2024
    const endDate2 = new Date(2024, 6, 31); // July 31, 2024
    const nextActivities = []
    for (let d = startDate2; d <= endDate2; d.setDate(d.getDate() + 1)) {
        nextActivities.push({
          date: new Date(d),
          activity_status: Math.random() > 0.5 // Random yes/no
        });
      }

      setActivities([
        { month: previousMonth, activities: prevActivities },
        { month: currentMonth, activities: currActivities },
        { month: nextMonth, activities: nextActivities }
      ]);
      setLoading(false);
    };

    loadActivities();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Activity Tracker</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto' }}>
        {activities.map(({ month, activities }) => (
          <Calendar key={month} month={month} activities={activities} />
        ))}
      </div>
    </div>
  );
};

export default ActivityTracker;
