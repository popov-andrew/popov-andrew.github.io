
// Deprecated: Handled by parseImage()

export const glsl = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
};

function formatDateString(dateString: string): { dateObj: Date; formatted: string } {
try {
    const parts = dateString.split('-');
    if (parts.length !== 3) throw new Error("Invalid date format");

    const month = parseInt(parts[0], 10) - 1; // JS months are 0-indexed
    const day = parseInt(parts[1], 10);
    const year = 2000 + parseInt(parts[2], 10); // I don't have any photos before 2000 :D

    const date = new Date(year, month, day);
    
    // Ordinal suffix logic (st, nd, rd, th) (kms)
    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const monthName = date.toLocaleString('default', { month: 'long' });
    const formatted = `${monthName} ${getOrdinal(day)}, ${year}`;

    return { dateObj: date, formatted };
  } catch (e) {
    // Fallback for invalid dates: return Epoch and raw string
    return { dateObj: new Date(0), formatted: '' };
  }
}

export interface GalleryImage {
  filename: string;
  src: string;
  dateObj: Date;
  formattedDate: string;
  title: string;
  description: string | null ; //null b/c optional
}

export function formatCaption(filename: string): string {
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExtension.replace(/_/g, " ");
}

export function parseFilename(filename: string): GalleryImage {
  const nameWIthoutExt = filename.replace(/\.[^/.]+$/, "");
  const parts = nameWIthoutExt.split('_');

  //If date is invalid/not found
  if(parts.length < 2) {
    return {
      filename,
      src: `/gallery/${filename}`,
      dateObj: new Date(0),
      formattedDate: '',
      title: nameWIthoutExt.replace(/_/g, ' '),
      description: null
    };
  }

  const {dateObj, formatted} = formatDateString(parts[0]);
  const title = parts[1];
  const description = parts.length > 2 ? parts.slice(2).join(' ') : null

  return {
    filename,
    src: '/gallery/' + filename,
    dateObj,
    formattedDate: formatted,
    title,
    description
  }
}