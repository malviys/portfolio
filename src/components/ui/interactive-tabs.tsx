"use client";

import * as React from "react";
import { Tabs } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface InteractiveTabsProps extends React.ComponentPropsWithoutRef<typeof Tabs> {
  groupId?: string;
  defaultValue: string;
}

export function InteractiveTabs({
  groupId = "default-tab-group",
  defaultValue,
  onValueChange,
  ...props
}: Readonly<InteractiveTabsProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryValue = searchParams.get(groupId);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleValueChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(groupId, newValue);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    // Also notify if there's any external listener
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const currentValue = mounted ? queryValue || defaultValue : defaultValue;

  if (!mounted) {
    // Return a lightweight version or just default on SSR to prevent hydration issues
    return <Tabs value={defaultValue} {...props} />;
  }

  return <Tabs value={currentValue} onValueChange={handleValueChange} {...props} />;
}
