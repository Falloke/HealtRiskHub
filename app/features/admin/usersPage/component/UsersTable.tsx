// E:\HealtRiskHub\app\features\admin\usersPage\component\UsersTable.tsx
"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { z } from "zod";
import {
  adminCreateUserSchema,
  adminEditUserSchema,
  type AdminCreateUser,
  type AdminEditUser,
} from "@/schemas/adminUserSchemas";

type AdminUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: string | null;
  position: string | null;
  province: string | null;
  brith_date?: string | null; // ISO
};

type EditForm = AdminEditUser;
type CreateForm = AdminCreateUser;

type ProvinceItem = {
  ProvinceNo: number;
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH?: string | null;
};

type EditErrors = Partial<Record<keyof EditForm, string>>;
type CreateErrors = Partial<Record<keyof CreateForm, string>>;

export default function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // ----- view modal -----
  const [viewing, setViewing] = useState<AdminUser | null>(null);

  // ----- edit modal -----
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [editErrors, setEditErrors] = useState<EditErrors>({});
  const [saving, setSaving] = useState(false);

  // ----- create modal -----
  const [creating, setCreating] = useState<CreateForm | null>(null);
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});
  const [creatingBusy, setCreatingBusy] = useState(false);

  // ----- provinces (เหมือน register) -----
  const [provinces, setProvinces] = useState<string[]>([]);
  const [provLoading, setProvLoading] = useState(true);
  const [provErr, setProvErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProvLoading(true);
        setProvErr(null);
        const res = await fetch("/data/Thailand-ProvinceName.json", {
          cache: "force-cache",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProvinceItem[] = await res.json();
        const names = data.map((p) => p.ProvinceNameThai).filter(Boolean);
        if (!names.length) throw new Error("empty province list");
        setProvinces(names);
      } catch (e) {
        console.error("โหลดจังหวัดล้มเหลว:", e);
        setProvErr("โหลดรายชื่อจังหวัดไม่สำเร็จ");
      } finally {
        setProvLoading(false);
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data: AdminUser[] = await res.json();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const softDelete = async (id: number) => {
    if (!confirm("ยืนยันปิดการใช้งานผู้ใช้?")) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setViewing((v) => (v?.id === id ? null : v));
      setEditing((e) => (e?.id === id ? null : e));
    } else {
      alert("ลบไม่สำเร็จ");
    }
  };

  // ---------- utils ----------
  const fmtDate = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return d.toISOString().slice(0, 10);
  };

  const zodToErrors = <T extends Record<string, unknown>>(
    err: z.ZodError
  ): Partial<Record<keyof T, string>> => {
    const out: Partial<Record<string, string>> = {};
    err.issues.forEach((i) => {
      const k = typeof i.path?.[0] === "string" ? (i.path[0] as string) : "";
      if (k) out[k] = i.message;
    });
    return out as Partial<Record<keyof T, string>>;
  };

  // ---------- View ----------
  const openView = (u: AdminUser) => setViewing(u);
  const closeView = () => setViewing(null);

  // ---------- Edit ----------
  const openEdit = (u: AdminUser) => {
    setEditing({
      id: u.id,
      first_name: u.first_name ?? "",
      last_name: u.last_name ?? "",
      email: u.email ?? "",
      role: (u.role as EditForm["role"]) ?? "User",
      position: u.position ?? "",
      province: u.province ?? "",
      brith_date: fmtDate(u.brith_date),
    });
    setEditErrors({});
  };
  const closeEdit = () => {
    setEditing(null);
    setEditErrors({});
  };

  const onEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setEditing((prev) => (prev ? { ...prev, [id]: value } as EditForm : prev));
    // clear field error
    const key = id as keyof EditErrors;
    setEditErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateEdit = (): boolean => {
    if (!editing) return false;
    const parsed = adminEditUserSchema.safeParse(editing);
    if (!parsed.success) {
      setEditErrors(zodToErrors<EditForm>(parsed.error));
      return false;
    }
    setEditErrors({});
    return true;
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!validateEdit()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          first_name: editing.first_name.trim(),
          last_name: editing.last_name.trim(),
          email: editing.email.trim(),
          role: editing.role,
          position: editing.position.trim(),
          province: editing.province.trim(),
          brith_date: editing.brith_date || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "บันทึกไม่สำเร็จ");
      }
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );
      closeEdit();
    } catch (e) {
      alert((e as Error).message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Create ----------
  const openCreate = () =>
    setCreating({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "User",
      position: "",
      province: "",
      brith_date: "",
    });

  const closeCreate = () => {
    setCreating(null);
    setCreateErrors({});
  };

  const onCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setCreating((prev) => (prev ? { ...prev, [id]: value } as CreateForm : prev));
    const key = id as keyof CreateErrors;
    setCreateErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateCreate = (): boolean => {
    if (!creating) return false;
    const parsed = adminCreateUserSchema.safeParse(creating);
    if (!parsed.success) {
      setCreateErrors(zodToErrors<CreateForm>(parsed.error));
      return false;
    }
    setCreateErrors({});
    return true;
  };

  const saveCreate = async () => {
    if (!creating) return;
    if (!validateCreate()) return;

    setCreatingBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: creating.first_name.trim(),
          last_name: creating.last_name.trim(),
          email: creating.email.trim(),
          password: creating.password,
          role: creating.role,
          position: creating.position.trim(),
          province: creating.province.trim(),
          brith_date: creating.brith_date,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "สร้างผู้ใช้ไม่สำเร็จ");
      }
      const created: AdminUser = await res.json();
      setUsers((prev) => [{ ...created }, ...prev]);
      closeCreate();
    } catch (e) {
      alert((e as Error).message || "เกิดข้อผิดพลาด");
    } finally {
      setCreatingBusy(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">ผู้ใช้งาน</h2>
        <button
          className="rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 shadow-sm"
          onClick={openCreate}
        >
          เพิ่มผู้ใช้
        </button>
      </div>

      {loading ? (
        <div>กำลังโหลด...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-500">ยังไม่มีผู้ใช้งาน</div>
      ) : (
        <>
          {/* header */}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-sm text-gray-500 px-2">
            <div>ชื่อ User</div>
            <div>อีเมล</div>
            <div className="text-right">เครื่องมือ</div>
          </div>

          {/* rows */}
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-4 py-3 bg-white hover:shadow-sm transition"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {u.first_name} {u.last_name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {u.position ?? "-"} {u.province ? `• ${u.province}` : ""}
                  </div>
                </div>

                <div className="min-w-0 truncate text-sm text-gray-800">
                  {u.email}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-md"
                    title="ดู"
                    onClick={() => openView(u)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-md"
                    title="แก้ไข"
                    onClick={() => openEdit(u)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-md"
                    title="ลบ (soft)"
                    onClick={() => softDelete(u.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- View Modal ---------- */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-pink-600">รายละเอียดผู้ใช้</h3>
              <button
                className="rounded-md p-2 hover:bg-gray-100"
                onClick={() => setViewing(null)}
                title="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">รหัสผู้ใช้</p>
                <p className="font-medium">{viewing.id}</p>
              </div>
              <div>
                <p className="text-gray-500">บทบาท</p>
                <p className="font-medium">{viewing.role ?? "User"}</p>
              </div>
              <div>
                <p className="text-gray-500">ชื่อ</p>
                <p className="font-medium">{viewing.first_name}</p>
              </div>
              <div>
                <p className="text-gray-500">นามสกุล</p>
                <p className="font-medium">{viewing.last_name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">อีเมล</p>
                <p className="font-medium break-all">{viewing.email}</p>
              </div>
              <div>
                <p className="text-gray-500">ตำแหน่ง</p>
                <p className="font-medium">{viewing.position ?? "-"}</p>
              </div>
              <div>
                <p className="text-gray-500">จังหวัด</p>
                <p className="font-medium">{viewing.province ?? "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">วันเกิด</p>
                <p className="font-medium">{fmtDate(viewing.brith_date)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewing(null);
                  openEdit(viewing);
                }}
                className="rounded-md border px-4 py-2 hover:bg-gray-50"
              >
                แก้ไข
              </button>
              <button
                onClick={() => setViewing(null)}
                className="rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Edit Modal ---------- */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-pink-600">แก้ไขโปรไฟล์ผู้ใช้</h3>
              <button
                className="rounded-md p-2 hover:bg-gray-100"
                onClick={closeEdit}
                title="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm">
                ชื่อ
                <input
                  id="first_name"
                  value={editing.first_name}
                  onChange={onEditChange}
                  className="mt-1 w-full rounded-md border p-2"
                />
                {editErrors.first_name && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.first_name}</p>
                )}
              </label>
              <label className="text-sm">
                นามสกุล
                <input
                  id="last_name"
                  value={editing.last_name}
                  onChange={onEditChange}
                  className="mt-1 w-full rounded-md border p-2"
                />
                {editErrors.last_name && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.last_name}</p>
                )}
              </label>

              <label className="col-span-2 text-sm">
                อีเมล
                <input
                  id="email"
                  type="email"
                  value={editing.email}
                  onChange={onEditChange}
                  className="mt-1 w-full rounded-md border p-2"
                />
                {editErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.email}</p>
                )}
              </label>

              <label className="text-sm">
                ตำแหน่ง
                <input
                  id="position"
                  value={editing.position}
                  onChange={onEditChange}
                  className="mt-1 w-full rounded-md border p-2"
                />
                {editErrors.position && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.position}</p>
                )}
              </label>

              {/* จังหวัด = select จากไฟล์ JSON */}
              <label className="text-sm">
                จังหวัด
                <select
                  id="province"
                  value={editing.province}
                  onChange={onEditChange}
                  disabled={provLoading || !!provErr}
                  className="mt-1 w-full rounded-md border p-2 disabled:bg-gray-100"
                >
                  <option value="">
                    {provLoading ? "กำลังโหลดจังหวัด..." : provErr ?? "กรุณาเลือกจังหวัด"}
                  </option>
                  {!provLoading &&
                    !provErr &&
                    provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                </select>
                {editErrors.province && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.province}</p>
                )}
              </label>

              <label className="text-sm">
                วันเกิด
                <input
                  id="brith_date"
                  type="date"
                  value={editing.brith_date}
                  onChange={onEditChange}
                  className="mt-1 w-full rounded-md border p-2"
                />
                {editErrors.brith_date && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.brith_date}</p>
                )}
              </label>

              <label className="text-sm">
                บทบาท
                <select
                  id="role"
                  value={editing.role}
                  onChange={onEditChange}
                  className="mt-1 w-full rounded-md border p-2"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                {editErrors.role && (
                  <p className="mt-1 text-xs text-red-600">{editErrors.role}</p>
                )}
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="rounded-md border px-4 py-2 hover:bg-gray-50"
                disabled={saving}
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Create Modal ---------- */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-pink-600">เพิ่มผู้ใช้ใหม่</h3>
              <button
                className="rounded-md p-2 hover:bg-gray-100"
                onClick={closeCreate}
                title="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm">
                ชื่อ
                <input
                  id="first_name"
                  value={creating.first_name}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
                {createErrors.first_name && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.first_name}</p>
                )}
              </label>
              <label className="text-sm">
                นามสกุล
                <input
                  id="last_name"
                  value={creating.last_name}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
                {createErrors.last_name && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.last_name}</p>
                )}
              </label>

              <label className="col-span-2 text-sm">
                อีเมล
                <input
                  id="email"
                  type="email"
                  value={creating.email}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
                {createErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.email}</p>
                )}
              </label>

              <label className="text-sm">
                รหัสผ่าน
                <input
                  id="password"
                  type="password"
                  value={creating.password}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
                {createErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.password}</p>
                )}
              </label>

              <label className="text-sm">
                ยืนยันรหัสผ่าน
                <input
                  id="confirmPassword"
                  type="password"
                  value={creating.confirmPassword}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
                {createErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {createErrors.confirmPassword}
                  </p>
                )}
              </label>

              <label className="text-sm">
                ตำแหน่ง
                <input
                  id="position"
                  value={creating.position}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                />
                {createErrors.position && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.position}</p>
                )}
              </label>

              {/* จังหวัด = select จากไฟล์ JSON */}
              <label className="text-sm">
                จังหวัด
                <select
                  id="province"
                  value={creating.province}
                  onChange={onCreateChange}
                  disabled={provLoading || !!provErr}
                  className="mt-1 w-full rounded-md border p-2 disabled:bg-gray-100"
                >
                  <option value="">
                    {provLoading ? "กำลังโหลดจังหวัด..." : provErr ?? "กรุณาเลือกจังหวัด"}
                  </option>
                  {!provLoading &&
                    !provErr &&
                    provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                </select>
                {createErrors.province && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.province}</p>
                )}
              </label>

              <label className="text-sm">
                วันเกิด
                <input
                  id="brith_date"
                  type="date"
                  value={creating.brith_date}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                  required
                />
                {createErrors.brith_date && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.brith_date}</p>
                )}
              </label>

              <label className="text-sm">
                บทบาท
                <select
                  id="role"
                  value={creating.role}
                  onChange={onCreateChange}
                  className="mt-1 w-full rounded-md border p-2"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                {createErrors.role && (
                  <p className="mt-1 text-xs text-red-600">{createErrors.role}</p>
                )}
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeCreate}
                className="rounded-md border px-4 py-2 hover:bg-gray-50"
                disabled={creatingBusy}
              >
                ยกเลิก
              </button>
              <button
                onClick={saveCreate}
                disabled={creatingBusy}
                className="rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 disabled:opacity-60"
              >
                {creatingBusy ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
