interface AlarmDetails {
  title: string;
  message: string;
}

const alarmsMap: { [alarmId: string]: AlarmDetails } = {};

function parseDateTime(dateTimeStr: string): Date | null {
  const parts = dateTimeStr.split(' ');
  if (parts.length !== 2) {
    return null;
  }

  const [datePart, timePart] = parts;
  const dateComponents = datePart.split('-');
  const timeComponents = timePart.split(':');

  if (dateComponents.length !== 3 || (timeComponents.length !== 2 && timeComponents.length !== 3)) {
    return null;
  }

  const year = parseInt(dateComponents[0], 10);
  const month = parseInt(dateComponents[1], 10) - 1;
  const day = parseInt(dateComponents[2], 10);
  const hour = parseInt(timeComponents[0], 10);
  const minute = parseInt(timeComponents[1], 10);
  const second = timeComponents.length === 3 ? parseInt(timeComponents[2], 10) : 0;

  return new Date(year, month, day, hour, minute, second);
}

function schedulePreEventAlarm(alarmId: string, dateTimeStr: string, title: string, message: string): void {
  const eventDate = parseDateTime(dateTimeStr);
  if (!eventDate) {
    console.error('Invalid date time string:', dateTimeStr);
    return;
  }

  const alarmTime = eventDate.getTime() - 24 * 60 * 60 * 1000;
  const now = Date.now();

  // if (alarmTime <= now) {
  //   console.warn('Alarm time is in the past. Cannot schedule alarm.');
  //   return;
  // }

  alarmsMap[alarmId] = { title, message };

  // chrome.alarms.create(alarmId, { when: alarmTime });
  chrome.alarms.create(alarmId, { delayInMinutes: 1 });
  console.log(`Alarm [${alarmId}] scheduled for ${new Date(alarmTime).toString()}`);
}

function cancelAlarm(alarmId: string): void {
  chrome.alarms.clear(alarmId, (wasCleared: boolean) => {
    if (wasCleared) {
      delete alarmsMap[alarmId];
      console.log(`Alarm [${alarmId}] cancelled successfully.`);
      chrome.notifications.create(`${alarmId}-cancelNotification`, {
        type: 'basic',
        iconUrl: 'images/icon/icon-128.png',
        title: '알람 취소됨',
        message: `알람 [${alarmId}]이 취소되었습니다.`,
        priority: 2,
      });
    } else {
      console.warn(`Failed to cancel alarm [${alarmId}] or it does not exist.`);
    }
  });
}

/**
 * 알람이 발생했을 때 해당 알람의 정보를 기반으로 알림(notification)을 띄우는 리스너
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  const alarmId = alarm.name;
  const details = alarmsMap[alarmId];
  if (details) {
    chrome.notifications.create(`${alarmId}-notification`, {
      type: 'basic',
      iconUrl: 'images/icon/icon-128.png',
      title: details.title,
      message: details.message,
      priority: 2,
    });
    delete alarmsMap[alarmId];
  }
});

/**
 * 메시지를 통해 알람 예약 및 취소 요청을 처리하는 리스너
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'scheduleAlarm') {
    const { alarmId, dateTime, title, message: alarmMessage } = message;
    schedulePreEventAlarm(alarmId, dateTime, title, alarmMessage);
    sendResponse({ status: 'scheduled', alarmId });
  } else if (message.action === 'cancelAlarm') {
    const { alarmId } = message;
    cancelAlarm(alarmId);
    sendResponse({ status: 'cancelled', alarmId });
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
