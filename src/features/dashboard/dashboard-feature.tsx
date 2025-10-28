import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Vote, BarChart3, Users, Shield } from 'lucide-react'
import React from 'react'
import Link from 'next/link'

const features = [
  {
    title: 'Create Polls',
    description: 'Launch custom polls with multiple options on the Solana blockchain',
    icon: <Vote className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Vote Securely',
    description: 'Cast your vote using your Solana wallet with complete transparency',
    icon: <Shield className="w-8 h-8 text-green-500" />,
  },
  {
    title: 'View Results',
    description: 'See real-time poll results powered by blockchain technology',
    icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
  },
  {
    title: 'Community Driven',
    description: 'Participate in decentralized decision-making with the community',
    icon: <Users className="w-8 h-8 text-purple-500" />,
  },
]

export default function DashboardFeature() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Decentralized Polling
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create and participate in transparent, tamper-proof polls powered by the Solana blockchain
        </p>
        <Link href="/poll">
          <Button size="lg" className="gap-2">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature) => (
          <Card key={feature.title} className="border-muted hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {feature.icon}
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-2xl">How It Works</CardTitle>
          <CardDescription>Three simple steps to create or participate in polls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Solana wallet to get started with creating or voting on polls
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Create or Browse</h3>
              <p className="text-sm text-muted-foreground">
                Create a new poll with custom options or browse existing polls to participate
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Vote & View Results</h3>
              <p className="text-sm text-muted-foreground">
                Cast your vote and see real-time results stored immutably on the blockchain
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
