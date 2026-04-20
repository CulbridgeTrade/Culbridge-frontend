"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Truck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-20 space-y-8 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
          Culbridge
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Live Backend Integration Complete
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-3">
              Open Dashboard
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-left">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Netherlands Corridor</h3>
            <p className="text-muted-foreground">Live compliance data</p>
          </div>
          <div className="text-left">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Germany Corridor</h3>
            <p className="text-muted-foreground">Real backend integration</p>
          </div>
          <div className="text-left">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
            <p className="text-muted-foreground">No mocks. Error handling included.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

