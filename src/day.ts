import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

export function ISOStringFormat(ISOString: string): string {
  return dayjs(ISOString).format('YYYY-MM-DD HH:mm:ss');
}
