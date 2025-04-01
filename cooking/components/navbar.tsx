"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, ShoppingCart, Package, Utensils, Notebook, User, Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { authApi } from "@/lib/api";

interface NavbarProps {
  isChatbotOpen: boolean;
  setIsChatbotOpen: (isOpen: boolean) => void;
}

const routes = [
  {
    name: "Ricette",
    path: "/ricette",
    icon: <ChefHat className="h-4 w-4 mr-2" />,
  },
  {
    name: "Lista della Spesa",
    path: "/lista-spesa",
    icon: <ShoppingCart className="h-4 w-4 mr-2" />,
  },
  {
    name: "Dispensa",
    path: "/dispensa",
    icon: <Package className="h-4 w-4 mr-2" />,
  },
  {
    name: "Dieta",
    path: "/dieta",
    icon: <Utensils className="h-4 w-4 mr-2" />,
  },
  {
    name: "Note",
    path: "/note",
    icon: <Notebook className="h-4 w-4 mr-2" />,
  },
];

export function Navbar({ isChatbotOpen, setIsChatbotOpen }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Carica i dati dell'utente dal localStorage
  useEffect(() => {
    const user = authApi.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);

    toast({
      title: "Logout effettuato",
      description: "Hai effettuato il logout con successo",
    });

    // Reindirizza alla home
    router.push("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ChefHat className="h-6 w-6" />
            <span className="font-bold">CucinaApp</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center transition-colors hover:text-foreground/80",
                  pathname === route.path ? "text-foreground" : "text-foreground/60"
                )}
              >
                {route.icon}
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profilo" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profilo
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Accedi</Link>
              </Button>
            )}
          </nav>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                <ChefHat className="h-6 w-6" />
                <span className="font-bold">CucinaApp</span>
              </Link>
              <nav className="mt-8 flex flex-col gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                      pathname === route.path ? "text-foreground" : "text-foreground/60"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {route.icon}
                    {route.name}
                  </Link>
                ))}
                <Link
                  href="/profilo"
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                    pathname === "/profilo" ? "text-foreground" : "text-foreground/60"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profilo
                </Link>

                {currentUser ? (
                  <Button
                    variant="ghost"
                    className="justify-start px-2"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button variant="ghost" className="justify-start px-2" asChild onClick={() => setOpen(false)}>
                    <Link href="/login">Accedi</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
