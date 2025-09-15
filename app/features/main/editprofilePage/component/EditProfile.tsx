"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputWithLabel } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import ConfirmDialog from "@/app/components/ui/dialog";
import { useSession } from "next-auth/react";

type EditProfileForm = {
  firstName: string;
  lastName: string;
  province: string;
  dob: string;
  position: string;
  email: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

const Editprofile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<EditProfileForm | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<EditProfileForm | null>(null);

  const { register, handleSubmit, setValue } = useForm<EditProfileForm>();
  const { update, data: session } = useSession(); // ✅ ใช้ update จาก next-auth

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("โหลดโปรไฟล์ล้มเหลว:", text || res.statusText);
          return;
        }

        const data: EditProfileForm = await res.json();
        setProfileData(data);

        // ✅ เซ็ตค่าเริ่มต้นลงในฟอร์ม
        setValue("firstName", data.firstName);
        setValue("lastName", data.lastName);
        setValue("province", data.province);
        setValue("dob", data.dob);
        setValue("position", data.position);
        setValue("email", data.email);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [setValue]);

  const onSubmitPreview = (data: EditProfileForm) => {
    if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
      alert("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    setPendingData(data);
    setConfirmOpen(true);
  };

  const doUpdate = async () => {
    if (!pendingData) return;
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingData),
      });

      if (res.ok) {
        const updated = await res.json();

        // ✅
        // อัปเดต session ทันที       = (session?.user?.first_name ?? "") + " " +
        await update({
          user: {
            firstName: updated.profile.first_name,
            lastName: updated.profile.last_name,
            email: updated.profile.email,
          },
        });

        alert("แก้ไขโปรไฟล์สำเร็จ");
        setProfileData(updated.profile);
      } else {
        const err = await res.json();
        console.error(err);
        alert("แก้ไขไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-100">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-xl bg-white">
        {/* Left Side */}
        <div className="flex w-1/2 items-center justify-center bg-pink-100">
          <Image
            src="/images/editprofile.png"
            alt="Edit Profile"
            width={400}
            height={400}
          />
        </div>

        {/* Right Side */}
        <div className="w-1/2 p-10">
          <h2 className="mb-8 text-center text-3xl font-bold text-pink-600">
            แก้ไขโปรไฟล์
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmitPreview)}>
            <div className="grid grid-cols-2 gap-4">
              <InputWithLabel
                id="firstName"
                label="ชื่อ"
                {...register("firstName")}
              />
              <InputWithLabel
                id="lastName"
                label="นามสกุล"
                {...register("lastName")}
              />
            </div>

            <InputWithLabel
              id="province"
              label="จังหวัด"
              {...register("province")}
            />
            <InputWithLabel
              id="dob"
              label="วันเกิด"
              type="date"
              {...register("dob")}
            />
            <InputWithLabel
              id="position"
              label="ตำแหน่ง"
              {...register("position")}
            />
            <InputWithLabel
              id="email"
              label="Email"
              type="email"
              {...register("email")}
            />

            {/* password ใหม่ */}
            <InputWithLabel
              id="newPassword"
              label="รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
              type="password"
              {...register("newPassword")}
            />
            <InputWithLabel
              id="confirmNewPassword"
              label="ยืนยันรหัสผ่านใหม่"
              type="password"
              {...register("confirmNewPassword")}
            />

            <Button
              type="submit"
              className="w-full bg-pink-500 text-white hover:bg-pink-600"
            >
              บันทึกการแก้ไข
            </Button>
          </form>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ยืนยันการแก้ไขโปรไฟล์?"
        description="โปรดตรวจสอบข้อมูลของคุณก่อนบันทึก"
        onConfirm={doUpdate}
        disabled={loading}
      >
        {pendingData && (
          <div className="space-y-2 rounded-lg border p-4 text-sm">
            <p>
              <span className="font-medium">ชื่อ:</span> {pendingData.firstName}
            </p>
            <p>
              <span className="font-medium">นามสกุล:</span>{" "}
              {pendingData.lastName}
            </p>
            <p>
              <span className="font-medium">จังหวัด:</span>{" "}
              {pendingData.province}
            </p>
            <p>
              <span className="font-medium">วันเกิด:</span> {pendingData.dob}
            </p>
            <p>
              <span className="font-medium">ตำแหน่ง:</span>{" "}
              {pendingData.position}
            </p>
            <p>
              <span className="font-medium">Email:</span> {pendingData.email}
            </p>
            {pendingData.newPassword && (
              <p className="text-red-500">⚠️ จะมีการเปลี่ยนรหัสผ่าน</p>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default Editprofile;
