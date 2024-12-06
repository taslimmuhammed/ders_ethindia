import React from 'react';
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Menu } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import ConnectWallet from './ConnectWallet';
import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="border-b bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <span className="text-xl font-bold">DERS</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">

                        <Link href="/alerts"><Button variant="ghost">Alerts</Button></Link>
                        <Link href="/contracts"><Button variant="ghost">Contracts</Button></Link>
                        <Link href="/register"><Button variant="ghost">Register</Button></Link>
                        <Link href="/profile"><Button variant="ghost">Profile</Button></Link>
                        {/* Desktop Select */}
                        {/* <SelectProduct /> */}

                        <ConnectWallet />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>Navigation Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col space-y-4 mt-8">
                                    <Link href="/alerts"><Button variant="ghost">Alerts</Button></Link>
                                    <Link href="/contracts"><Button variant="ghost">Contract</Button></Link>
                                    <Link href="/register"><Button variant="ghost">Register</Button></Link>
                                    <Link href="/profile"><Button variant="ghost">Profile</Button></Link>
                                    <ConnectWallet/>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Separated Select component for reuse
const SelectProduct = () => {
    return (
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="pro">Professional</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
            </SelectContent>
        </Select>
    );
};

export default Navbar;