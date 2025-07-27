
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Building, Landmark, Percent } from "lucide-react";
import MapComponent from "./map-component";
import { useState } from "react";
import { cn } from "@/lib/utils";

const opportunities = [
    { id: 'hjt', name: 'Hinjewadi Tech Park, Pune', type: 'Commercial', details: '12% projected appreciation due to metro expansion.', position: { lat: 18.5913, lng: 73.7384 } },
    { id: 'wfd', name: 'Whitefield, Bangalore', type: 'Residential', details: 'High rental demand from IT corridor.', position: { lat: 12.9698, lng: 77.7500 } },
    { id: 'cit', name: 'Chennai IT Corridor', type: 'Commercial', details: 'Growing infrastructure and new office spaces.', position: { lat: 12.9082, lng: 80.2263 } },
    { id: 'bkc', name: 'Bandra Kurla Complex, Mumbai', type: 'Commercial', details: 'Premium office space with high rental yields.', position: { lat: 19.0663, lng: 72.8694 } },
    { id: 'dlf', name: 'DLF Cyber City, Gurgaon', type: 'Residential', details: 'Proximity to major corporate hubs drives rental demand.', position: { lat: 28.4947, lng: 77.0898 } },
];

export default function MapPage() {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const handleMarkerClick = (id: string) => {
    setActiveMarkerId(id);
    const element = document.getElementById(`opp-${id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardHover = (id: string) => {
      setActiveMarkerId(id);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
      <div className="lg:col-span-2 relative h-full">
          <MapComponent 
            markers={opportunities} 
            onMarkerClick={handleMarkerClick} 
            activeMarkerId={activeMarkerId} 
          />
      </div>

      <div className="h-full flex flex-col gap-6">
        <Card className="flex-shrink-0 shadow-sm bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Data Layers</CardTitle>
            <CardDescription>Toggle different data layers on the map.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="residential" defaultChecked />
              <Label htmlFor="residential" className="flex items-center gap-2 cursor-pointer"><Building className="h-4 w-4 text-primary" /> Residential Property</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="commercial" defaultChecked />
              <Label htmlFor="commercial" className="flex items-center gap-2 cursor-pointer"><Landmark className="h-4 w-4 text-accent" /> Commercial Property</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="yield" />
              <Label htmlFor="yield" className="flex items-center gap-2 cursor-pointer"><Percent className="h-4 w-4 text-warning" /> Rental Yields</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm bg-card/80 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Hyperlocal Opportunities</CardTitle>
                <CardDescription>AI-generated insights on specific locations.</CardDescription>
            </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 pr-3">
            {opportunities.map(opp => (
              <div 
                key={opp.id} 
                id={`opp-${opp.id}`}
                onMouseEnter={() => handleCardHover(opp.id)}
                onMouseLeave={() => handleCardHover(null)}
                className={cn("p-3 rounded-lg border bg-background/50 hover:bg-secondary/50 transition-all duration-200 cursor-pointer", {
                    "bg-primary/10 border-primary shadow-md": activeMarkerId === opp.id
                })}
              >
                <p className="font-semibold">{opp.name}</p>
                <p className="text-sm text-muted-foreground">{opp.details}</p>
                <p className={`text-xs font-bold mt-1 ${opp.type === 'Commercial' ? 'text-accent' : 'text-primary'}`}>{opp.type}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    