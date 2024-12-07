"use client"
import LandingPage from "@/components/Components/LandingPage";
import { EthersContext } from "@/context/EthersContext";
import Image from "next/image";
import { useContext, useEffect } from "react";
import { useOkto } from 'okto-sdk-react';

export default function Home() {
  const { getWallets } = useOkto();
  const {address} = useContext(EthersContext)
  const initiator = async()=>{
    const wallets = await getWallets();
    console.log(wallets);
  }
  useEffect(() => {
    initiator()
  }, [])
  
  return (
    <div>
      <LandingPage address={address}/>
    </div>
  );
}
