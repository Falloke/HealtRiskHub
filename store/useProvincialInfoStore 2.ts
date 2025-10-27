"use client";

import { create } from "zustand";

type ProvincialInfoState = {
  diseaseCode: string | null;
  diseaseNameTh: string | null;
  province: string | null;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null;

  // actions
  initDefaultDisease: () => Promise<void>;
  setDisease: (code: string | null, nameTh: string | null) => void;
  setProvince: (p: string | null) => void;
  setDateRange: (start: string | null, end: string | null) => void;
};

type InternalState = {
  _bootstrapped: boolean; // กันเรียก init ซ้ำ ๆ
};

export const useProvincialInfoStore = create<
  ProvincialInfoState & InternalState
>((set, get) => ({
  // state
  diseaseCode: null,
  diseaseNameTh: null,
  province: null,
  start_date: null,
  end_date: null,
  _bootstrapped: false,

  // actions
  setDisease: (code, nameTh) =>
    set({ diseaseCode: code, diseaseNameTh: nameTh }),

  setProvince: (p) => set({ province: p }),

  setDateRange: (start, end) => set({ start_date: start, end_date: end }),

  initDefaultDisease: async () => {
    const { _bootstrapped, diseaseCode } = get();
    if (_bootstrapped || diseaseCode) return; // เคยตั้งแล้ว ไม่ต้องทำซ้ำ

    // 1) จาก URL ?disease= (ถ้ามี)
    try {
      const sp = new URLSearchParams(window.location.search);
      const qsDisease = sp.get("disease");
      if (qsDisease) {
        set({
          diseaseCode: qsDisease.toUpperCase(),
          diseaseNameTh: null,
          _bootstrapped: true,
        });
        return;
      }
    } catch {
      /* noop */
    }

    // 2) โหลดรายชื่อโรคจาก API แล้วตั้ง default (D01 หรืออันแรก)
    try {
      const res = await fetch("/api/diseases", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { diseases } = (await res.json()) as {
        diseases: { code: string; name_th: string }[];
      };

      const d01 = diseases.find((d) => d.code === "D01") ?? diseases[0];
      if (d01) {
        set({
          diseaseCode: d01.code,
          diseaseNameTh: d01.name_th,
          _bootstrapped: true,
        });
      } else {
        set({ _bootstrapped: true }); // ไม่มีรายการ ให้ถือว่าบูตแล้ว
      }
    } catch {
      set({ _bootstrapped: true }); // เงียบ ๆ ไปก่อน ให้ UI จัดการ error เอง
    }
  },
}));
