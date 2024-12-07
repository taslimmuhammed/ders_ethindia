import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Github, Twitter } from "lucide-react"
import ConnectWallet from "./ConnectWallet"
import Link from "next/link"
import SignInButton from "./SignInButton"

const LandingPage = ({address}) => {
    const features = [
        {
            title: "Secure smart contracts",
            description: "Secure the smart contract with the help of the validators"
        },
        {
            title: "Fully decentralized",
            description: "Leveraging the consesnsus algorithms for alerts"
        },
        {
            title: "Quick resposnse AI",
            description: "AI that monitors your smart contract"
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-24">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        Secure DEFI Future
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Protect smart contract with help of validators.
                    </p>
                    
                        {/* {address==''?<ConnectWallet/>:
                        <div className="flex gap-4 justify-center">
                        <Button size="lg" className="gap-2">
                            <Link href="/alerts">
                            Validate Alerts
                            </Link>
                        </Button>
                            
                        <Button size="lg" variant="outline" className="gap-2">
                                <Link href="/contracts">
                            Review Contracts 
                                </Link>
                            </Button></div>} */}
                    <SignInButton/>
                       
                    
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-lg">
                            <CardContent className="pt-6">
                                <CheckCircle className="w-12 h-12 text-purple-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LandingPage