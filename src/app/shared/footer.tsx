"use client";

import Interactive from "@/components/ui/interactive";
import { NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { NavigationMenu } from "@radix-ui/react-navigation-menu";

export default function Footer() {

  return (
    <footer className="bg-foreground text-background">
      <div className="container p-4">
        <NavigationMenu>
          <NavigationMenuList className="gap-4">
            <Interactive>
              <NavigationMenuItem>
                <NavigationMenuLink href="https://www.linkedin.com/in/malviys" target="_blank">
                  @LinkedIn
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Interactive>
            <Interactive>
              <NavigationMenuItem>
                <NavigationMenuLink href="mailto:saurabhmalvia997@gmail.com?subject=Connection Request" target="_blank">
                  @Email
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Interactive>
            <Interactive>
              <NavigationMenuItem>
                <NavigationMenuLink href="https://www.github.com/malviys" target="_blank">
                  @Github
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Interactive>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </footer>
  );
}
