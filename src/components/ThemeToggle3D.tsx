"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";

export default function ThemeToggle3D() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDark = savedTheme
      ? savedTheme === "dark"
      : prefersDark;

    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const newTheme = !dark;
    setDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  return (
    <button
      onClick={toggle}
      className={clsx(
        "w-full flex items-center justify-end px-4 py-2 gap-3 rounded-md transition-all duration-300",
        "bg-gradient-to-r from-purple-300 to-sky-200 dark:from-darkAccent1 dark:to-darkAccent2",
        "hover:scale-[1.03] active:scale-95 shadow-md dark:shadow-black/40"
      )}
    >
      {dark ? (
        <Sun className="text-yellow-300 w-5 h-5" />
      ) : (
        <Moon className="text-blue-500 w-5 h-5" />
      )}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:block">
        {dark ? "وضع النهار" : "وضع الليل"}
      </span>
    </button>
  );
}