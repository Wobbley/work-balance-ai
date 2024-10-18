import Holidays from 'date-holidays';

export function humanReadableTime(hoursAsDecimal: number) {
	const sign = hoursAsDecimal >= 0 ? 1 : -1;
	hoursAsDecimal = hoursAsDecimal * sign;
	const hour = Math.floor(hoursAsDecimal);
	let decimalPart = hoursAsDecimal - hour;
	const min = 1 / 60;
	decimalPart = min * Math.round(decimalPart / min);
	let minute = Math.floor(decimalPart * 60) + '';

	if (minute.length < 2) {
		minute = '0' + minute;
	}
	const finalSign = sign === 1 ? '' : '-';

	return finalSign + hour + ':' + minute;
}

export function workDays(startDate: Date, endDate: Date): number {
	const hd = new Holidays('NO', { types: ['public', 'bank'] });
	let count = 0;
	const curDate = new Date(startDate.getTime());
	while (curDate <= endDate) {
		const dayOfWeek = curDate.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6 && !hd.isHoliday(curDate)) count++;
		curDate.setDate(curDate.getDate() + 1);
	}
	return count;
}