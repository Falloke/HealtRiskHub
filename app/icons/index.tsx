// app/icons/index.tsx
import React from "react";

// 👇 ต้องมี export ข้างหน้า
export const iconPaths = {
  Delete: "/icons/delete.svg",
  Dropdown: "/icons/dropdown.svg",
  Edit: "/icons/editsquare.svg",
  File: "/icons/file.svg",
  Globe: "/icons/globe.svg",
  Logout: "/icons/logout.svg",
  Next: "/icons/next.svg",
  Reverse: "/icons/revers.svg",
  Search: "/icons/search.svg",
  Settings: "/icons/settings.svg",
  Show: "/icons/show.svg",
  User: "/icons/user.svg",
  Window: "/icons/window.svg",
} as const;

type IconName = keyof typeof iconPaths;

type IconProps = {
  name: IconName;
  size?: number; // px
  colorClass?: string; // tailwind class เช่น "bg-red-500" หรือ "bg-current"
} & React.HTMLAttributes<HTMLSpanElement>;

export const Icons: React.FC<IconProps> = ({
  name,
  size = 24,
  colorClass = "bg-current",
  className = "",
  style,
  ...rest
}) => {
  const src = iconPaths[name];
  if (!src) return null;

  const safeStyle = typeof style === "string" ? {} : style;

  return (
    <span
      className={`inline-block align-middle ${colorClass} ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        ...safeStyle,
      }}
      {...rest}
    />
  );
};
