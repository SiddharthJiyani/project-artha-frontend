"use client"

import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { darkMapStyle, lightMapStyle } from './map-styles';

interface MapComponentProps {
    markers: {
        id: string;
        name: string;
        position: { lat: number; lng: number; };
    }[];
    onMarkerClick: (id: string) => void;
    activeMarkerId: string | null;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
};

const center = {
    lat: 19.0760,
    lng: 72.8777
};

export default function MapComponent({ markers, onMarkerClick, activeMarkerId }: MapComponentProps) {
    const { resolvedTheme } = useTheme();
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        zoomControl: true,
        styles: resolvedTheme === 'dark' ? darkMapStyle : lightMapStyle
    }), [resolvedTheme]);

    if (loadError) {
        return <div className='flex items-center justify-center h-full'>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <Skeleton className="h-full w-full" />;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            options={mapOptions}
        >
            {markers.map(marker => (
                <MarkerF
                    key={marker.id}
                    position={marker.position}
                    title={marker.name}
                    onClick={() => onMarkerClick(marker.id)}
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: activeMarkerId === marker.id ? 10 : 7,
                        fillColor: activeMarkerId === marker.id ? "hsl(var(--primary))" : "hsl(var(--accent))",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "hsl(var(--background))",
                    }}
                />
            ))}
        </GoogleMap>
    );
}