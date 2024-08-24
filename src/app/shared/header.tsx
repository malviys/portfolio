import Interactive from "@/components/ui/interactive";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function Header() {
  return null;

  return (
    <header>
      <div className="container p-4">
        <NavigationMenu>
          <NavigationMenuList className="gap-4">
            <Interactive>
              <NavigationMenuItem>
                <NavigationMenuLink href="/" className="rounded-sm underline">
                  Malviys
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Interactive>
            <Interactive>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about" className="rounded-sm underline">
                  About Me
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Interactive>
            <Interactive>
              <NavigationMenuItem>
                <NavigationMenuLink href="/project" className="rounded-sm underline">
                  Projects
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Interactive>
            <Interactive>
              <NavigationMenuItem>
                <NavigationMenuLink href="/blog" className="rounded-sm underline">
                  Blogs
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Interactive>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
