/**
 * Translation utilities for pet and report species and statuses
 */

// Pet species translations
export const translatePetSpecies = (species: string): string => {
  const translations: Record<string, string> = {
    dog: "Chó",
    cat: "Mèo",
    bird: "Chim",
    other: "Khác",
  };
  return translations[species.toLowerCase()] || species;
};

// Pet status translations
export const translatePetStatus = (status: string): string => {
  const translations: Record<string, string> = {
    available: "Còn trống",
    adopted: "Đã nhận nuôi",
    pending: "Chờ duyệt",
  };
  return translations[status.toLowerCase()] || status;
};

// Report species translations (same as pet species)
export const translateReportSpecies = (species: string): string => {
  return translatePetSpecies(species);
};

// Report status translations
export const translateReportStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: "Chờ xử lý",
    assigned: "Đã phân công",
    resolved: "Đã giải quyết",
    closed: "Đã đóng",
  };
  return translations[status.toLowerCase()] || status;
};

// Pet size translations
export const translatePetSize = (size: string): string => {
  const translations: Record<string, string> = {
    small: "Nhỏ",
    medium: "Trung bình",
    large: "Lớn",
  };
  return translations[size.toLowerCase()] || size;
};

// Pet gender translations
export const translatePetGender = (gender: string): string => {
  const translations: Record<string, string> = {
    male: "Đực",
    female: "Cái",
    unknown: "Không rõ",
  };
  return translations[gender.toLowerCase()] || gender;
};

// Report urgency level translations
export const translateUrgencyLevel = (urgency: string): string => {
  const translations: Record<string, string> = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    critical: "Nghiêm trọng",
  };
  return translations[urgency.toLowerCase()] || urgency;
};

// Report type translations
export const translateReportType = (type: string): string => {
  const translations: Record<string, string> = {
    injured: "Bị thương",
    stray: "Lạc",
    abused: "Bị ngược đãi",
    sick: "Bị bệnh",
    abandoned: "Bị bỏ rơi",
    other: "Khác",
  };
  return translations[type.toLowerCase()] || type.replace(/_/g, " ");
};
