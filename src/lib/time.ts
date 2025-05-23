export function getFormattedTimestampToDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function getCurrentTimestampMySQL(): string {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Converts a date representation (Date object, ISO string, etc.)
 * into a 'YYYY-MM-DD' string format suitable for MySQL DATE columns
 * or DATETIME columns when only the date part is relevant.
 * It ensures that the date is interpreted correctly regardless of whether
 * the input is a Date object or a string, extracting the year, month, and day
 * components as perceived in the input's context (usually local time if ambiguous).
 *
 * @param dateInput The date to format. Can be a Date object,
 *                  an ISO 8601 string, or any string parseable by `new Date()`.
 * @returns A string in 'YYYY-MM-DD' format, or null if the input is null, undefined, or invalid.
 */
export function formatDateForMySQL(dateInput: string | Date | null | undefined): string | null {
  if (dateInput === null || typeof dateInput === 'undefined') {
    return null;
  }

  let date: Date;
  // If dateInput is already a Date object, use it directly.
  // Otherwise, try to parse it.
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    // For strings, new Date() will attempt to parse.
    // Common formats like ISO strings ('YYYY-MM-DDTHH:mm:ss.sssZ') are parsed correctly.
    // Strings like 'YYYY-MM-DD' are parsed as UTC midnight.
    // Strings like 'MM/DD/YYYY' are parsed based on browser locale's interpretation,
    // which can be ambiguous. It's best if date strings from UI are ISO or YYYY-MM-DD.
    date = new Date(dateInput);
  }

  // Check if the parsed date is valid
  if (isNaN(date.getTime())) {
    // If parsing failed, and the original input was a string that already looks like 'YYYY-MM-DD',
    // we can assume it's correctly formatted and return it. This handles cases where
    // `new Date('YYYY-MM-DD')` might be valid but some other string input isn't.
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
    }
    console.warn('Invalid date value provided to formatDateForMySQL:', dateInput);
    return null;
  }

  const year = date.getFullYear();
  // getMonth() is 0-indexed (0 for January, 11 for December)
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Converts a MySQL date string (typically 'YYYY-MM-DD' from a DATE column
 * or 'YYYY-MM-DD HH:MM:SS' from DATETIME/TIMESTAMP) into a JavaScript Date object.
 * This is useful for initializing date pickers in UI components like MUI DataGrid.
 *
 * - For 'YYYY-MM-DD' strings (from MySQL DATE columns):
 *   It creates a Date object corresponding to midnight *local time*.
 *   This helps prevent off-by-one day issues in date pickers that operate in local time,
 *   which can occur if 'YYYY-MM-DD' is parsed as UTC midnight by `new Date()`.
 * - For strings with time components (e.g., from DATETIME/TIMESTAMP columns):
 *   It uses `new Date()` directly, which typically parses them correctly according to ISO 8601 if applicable.
 *
 * @param mysqlDateString The date string from MySQL.
 * @returns A Date object, or null if the input string is null, undefined, or invalid.
 */
export function parseMySQLDateString(mysqlDateString: string | null | undefined): Date | null {
  if (!mysqlDateString) {
    return null;
  }

  // Check if the string is in 'YYYY-MM-DD' format (date only)
  if (/^\d{4}-\d{2}-\d{2}$/.test(mysqlDateString)) {
    const parts = mysqlDateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed for JavaScript Date
    const day = parseInt(parts[2], 10);

    // Create a Date object for midnight local time
    const localDate = new Date(year, month, day);
    
    // Validate the constructed date
    if (isNaN(localDate.getTime()) || 
        localDate.getFullYear() !== year || 
        localDate.getMonth() !== month || 
        localDate.getDate() !== day) {
      console.warn('Invalid date components from parseMySQLDateString (YYYY-MM-DD):', mysqlDateString);
      return null;
    }
    return localDate;
  }

  // For other formats (e.g., 'YYYY-MM-DD HH:MM:SS' or full ISO strings),
  // let the Date constructor parse it.
  const date = new Date(mysqlDateString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string for parseMySQLDateString (fallback parsing):', mysqlDateString);
    return null;
  }
  return date;
}
