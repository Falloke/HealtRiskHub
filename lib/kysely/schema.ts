import { d01_influenza } from "./../../generated/prisma/index.d";
export interface Disease {
  code: string;
  name_th: string;
  name_en: string;
}
export interface D01Influenza {
  id: number;
  disease_code: string;
  gender: string | null;
  age_y: number | null;
  nationality: string | null;
  occupation: string | null;
  province: string | null;
  district: string | null;
  onset_date: string | null;
  treated_date: string | null;
  diagnosis_date: string | null;
  death_date: string | null;
  onset_date_parsed: Date;
  treated_date_parsed: Date | null;
  diagnosis_date_parsed: Date | null;
  death_date_parsed: Date | null;
}

export interface DB {
  diseases: Disease;
  d01_influenza: D01Influenza;
}
