"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/button";
import { SunFilledIcon, MoonFilledIcon } from "./icons";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      isIconOnly
      variant="light"
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <SunFilledIcon className="h-5 w-5" />
      ) : (
        <MoonFilledIcon className="h-5 w-5" />
      )}
    </Button>
  );
}
