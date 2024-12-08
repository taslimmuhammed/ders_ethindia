"use client"
import React, {useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Menu } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import Link from 'next/link';
import SignInButton from './SignInButton';

const Navbar = () => {
    return (
        <nav className="border-b bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <span className="text-xl font-bold"><Link href="/">DERS</Link></span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">

                        <Link href="/alerts"><Button variant="ghost">Alerts</Button></Link>
                        <Link href="/contracts"><Button variant="ghost">Contracts</Button></Link>
                        <Link href="/register"><Button variant="ghost">Register</Button></Link>
                        <Link href="/profile"><Button variant="ghost">Profile</Button></Link>
                        {/* Desktop Select */}
                        <SelectProduct />

                        {/* <ConnectWallet /> */}
                        <SignInButton/>
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
                                    {/* <ConnectWallet/> */}
                                    <SignInButton/>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const SelectProduct = () => {
    const [selectedValue, setSelectedValue] = useState('BASE');

    useEffect(() => {
        const storedValue = localStorage.getItem("blockchain");
        if (storedValue) {
            setSelectedValue(storedValue);
        }
    }, []);

    const handleValueChange = (newValue) => {
        setSelectedValue(newValue);
        localStorage.setItem("blockchain", newValue);
    }

    return (
        <Select value={selectedValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="BASE" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="BASE">Base Network</SelectItem>
                <SelectItem value="POLYGON_TESTNET_AMOY">POLYGON_TESTNET_AMOY</SelectItem>
            </SelectContent>
        </Select>
    )
}

export default Navbar;