"use client"
import ContractsList from "@/components/Components/ContractsList";
import LandingPage from "@/components/Components/LandingPage";
import { EthersContext } from "@/context/EthersContext";
import { BlockFunctions } from "@/utils/BlockFunctions";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

export default function Home() {
    const {setIsLoading } = useContext(EthersContext)
    const [contracts, setContracts] = useState([])
    const initiator = async()=>{
        setIsLoading(true)
        let contracts = await BlockFunctions.getContracts()
        setContracts(contracts);
        setIsLoading(false)
    }
    useEffect(() => {
      initiator()
    }, [])
    
    return (
        <div>
            <ContractsList contracts={contracts} />
        </div>
    );
}
