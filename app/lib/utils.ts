import crypto from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const formatDateToLocal = (dateStr: string, locale: string = 'en-US') => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const formatDateToLocalWithTime = (dateStr: string, locale: string = 'en-US') => {
  // console.log('formatDateToLocalWithTime');
  const date = dayjs(dateStr);
  const localDate = date.local();

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'full',
    timeStyle: 'long'
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(localDate.toDate());
};

export const formatDateToLocalWithTimeAndCoordinates = (
  dateStr: string,
  IANAtimezone: string,
  locale: string = 'en-US'
) => {
  const date = dayjs.utc(dateStr);

  // const localDate = date.local();

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: IANAtimezone
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date.toDate());
};

export function base64URLEncode(str) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}
