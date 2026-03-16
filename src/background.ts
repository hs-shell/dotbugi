interface AlarmDetails {
  title: string;
  message: string;
}

const alarmsMap: { [alarmId: string]: AlarmDetails } = {};

function parseDateTime(dateTimeStr: string): Date | null {
  const date = new Date(dateTimeStr.replace(' ', 'T'));
  return isNaN(date.getTime()) ? null : date;
}

function schedulePreEventAlarm(alarmId: string, dateTimeStr: string, title: string, message: string): void {
  const eventDate = parseDateTime(dateTimeStr);
  if (!eventDate) {
    console.error('Invalid date time string:', dateTimeStr);
    return;
  }

  const alarmTime = eventDate.getTime() - 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (alarmTime <= now) {
    console.warn('Alarm time is in the past. Cannot schedule alarm.');
    return;
  }

  alarmsMap[alarmId] = { title, message };

  chrome.alarms.create(alarmId, { when: alarmTime });
  console.log(`Alarm [${alarmId}] scheduled for ${new Date(alarmTime).toString()}`);
}

function cancelAlarm(alarmId: string): void {
  chrome.alarms.clear(alarmId, (wasCleared: boolean) => {
    if (wasCleared) {
      delete alarmsMap[alarmId];
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
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
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
