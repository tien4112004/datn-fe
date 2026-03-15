/**
 * Replace built-in placeholders in header/footer text.
 *
 * Supported tokens:
 *   {page}     → current page number (1-based; respects skipTitlePage)
 *   {date}     → local date string
 *   {time}     → local time string
 *   {datetime} → date + time string
 */
export function renderHeaderFooterPlaceholder(template: string, pageNumber: number) {
  if (!template) return template;
  const page = String(pageNumber);
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  const datetime = `${date} ${time}`;

  return template
    .replace(/\{page\}/g, page)
    .replace(/\{datetime\}/g, datetime)
    .replace(/\{date\}/g, date)
    .replace(/\{time\}/g, time);
}
