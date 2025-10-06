import { create } from "zustand";

type DashboardState = {
  province: string;
  start_date: string;
  end_date: string;
  setProvince: (p: string) => void;
  setDateRange: (s: string, e: string) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  province: "กรุงเทพมหานคร",
  start_date: "2024-01-01",
  end_date: "2024-06-30",
  setProvince: (p) => set({ province: p }),
  setDateRange: (s, e) => set({ start_date: s, end_date: e }),
}));
