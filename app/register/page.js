"use client"
import LandingPage from "@/components/Components/LandingPage";
import RegisterContractForm from "@/components/Components/RegisterForm";
import { EthersContext } from "@/context/EthersContext";
import Image from "next/image";
import { useContext } from "react";

export default function Home() {
    const { address } = useContext(EthersContext)
    return (
        <div>
            <RegisterContractForm/>
        </div>
    );
}