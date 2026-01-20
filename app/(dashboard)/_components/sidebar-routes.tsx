"use client";

import { Layout, Calendar, Folder, CalendarCheck } from "lucide-react";
import { MdGrading } from "react-icons/md";
import SidebarItem from "./sidebar-item";

const guestRoutes = [
  {
    label: "Dashboard",
    icon: Layout,
    href: "/students",
  },
  {
    label: "TimeTable",
    icon: Calendar,
    href: "/timetable",
  },
  {
    label: "Directory",
    icon: Folder,
    href: "/directory",
  },
  {
    label: "Attendance",
    icon: CalendarCheck,
    href: "/attendance",
  },
  {
    label: "Grading",
    icon: MdGrading,
    href: "/grading",
  },
];

const SidebarRoutes = () => {
  const routes = guestRoutes;
  return (
    <div className="flex flex-col w-full">
      {routes.map((item) => (
        <SidebarItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
        />
      ))}
    </div>
  );
};

export default SidebarRoutes;
