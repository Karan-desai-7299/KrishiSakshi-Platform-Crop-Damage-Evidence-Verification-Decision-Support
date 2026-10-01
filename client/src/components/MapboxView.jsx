import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, AlertTriangle, Layers, CloudRain } from 'lucide-react';

export default function MapboxView({ 
  center = [74.243, 16.705], 
  zoom = 9,
  locationsData = null,
  thresholdMm = 100
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Cleanup markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!token || token.includes('placeholder')) {
      setMapError('A valid Mapbox public token is required in client/.env (VITE_MAPBOX_TOKEN). Displaying fallback GIS overview with active coordinate metrics.');
      return;
    }

    try {
      mapboxgl.accessToken = token;
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: center,
        zoom: zoom,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        renderMarkers(map);
      });

      map.on('error', (e) => {
        console.warn('Mapbox error:', e);
        setMapError('Unable to load Mapbox tiles. Please verify VITE_MAPBOX_TOKEN.');
      });

      mapRef.current = map;

      return () => {
        clearMarkers();
        map.remove();
      };
    } catch (err) {
      console.error('Mapbox initialization error:', err);
      setMapError('Mapbox initialization error: ' + err.message);
    }
  }, [token]);

  // Re-render markers whenever locationsData changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderMarkers(mapRef.current);
    }
  }, [locationsData, thresholdMm]);

  const renderMarkers = (map) => {
    clearMarkers();

    const items = locationsData || [
      { locationName: 'Kolhapur', latitude: 16.705, longitude: 74.243, cumulativeRainfallMm: null },
      { locationName: 'Kagal', latitude: 16.576, longitude: 74.314, cumulativeRainfallMm: null },
      { locationName: 'Panhala', latitude: 16.810, longitude: 74.110, cumulativeRainfallMm: null },
      { locationName: 'Shirol', latitude: 16.737, longitude: 74.597, cumulativeRainfallMm: null },
      { locationName: 'Gadhinglaj', latitude: 16.226, longitude: 74.346, cumulativeRainfallMm: null }
    ];

    items.forEach((loc) => {
      const isTriggered = loc.thresholdExceeded || (loc.cumulativeRainfallMm && loc.cumulativeRainfallMm >= thresholdMm);
      const markerColor = isTriggered ? '#C62828' : '#1565C0';

      const popupHtml = `
        <div style="font-family: inherit; padding: 6px; min-width: 170px;">
          <div style="font-weight: 700; color: #263238; font-size: 13px;">${loc.locationName}</div>
          <div style="font-size: 11px; color: #607D8B; margin-top: 2px;">
            Coords: ${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)}
          </div>
          ${loc.cumulativeRainfallMm !== null && loc.cumulativeRainfallMm !== undefined ? `
            <div style="margin-top: 6px; padding: 4px 6px; background: ${isTriggered ? '#FFEBEE' : '#E3F2FD'}; border-radius: 4px; border: 1px solid ${isTriggered ? '#FFCDD2' : '#BBDEFB'};">
              <div style="font-size: 11px; font-weight: 600; color: ${isTriggered ? '#C62828' : '#1565C0'};">
                Cumulative: ${loc.cumulativeRainfallMm} mm
              </div>
              ${loc.maxSingleDayMm ? `<div style="font-size: 10px; color: #607D8B;">Max Single Day: ${loc.maxSingleDayMm} mm</div>` : ''}
              <div style="font-size: 10px; font-weight: 600; margin-top: 2px; color: ${isTriggered ? '#C62828' : '#2E7D32'};">
                ${isTriggered ? '▲ Threshold Triggered' : '● Normal Range'}
              </div>
            </div>
          ` : '<div style="font-size: 11px; color: #607D8B; margin-top: 4px;">Weather reference point</div>'}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

      // Create custom element for marker circle
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = isTriggered ? '24px' : '18px';
      el.style.height = isTriggered ? '24px' : '18px';
      el.style.backgroundColor = markerColor;
      el.style.border = '2px solid #FFFFFF';
      el.style.borderRadius = '50%';
      el.style.boxShadow = isTriggered ? '0 0 10px rgba(198, 40, 40, 0.6)' : '0 2px 5px rgba(0,0,0,0.2)';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  return (
    <div className="relative w-full h-[420px] rounded-card overflow-hidden border border-border-default bg-[#FFFFFF] shadow-subtle">
      {/* Map Legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 px-3 py-2 rounded-md border border-border-default text-xs shadow-sm flex flex-col gap-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-2 font-semibold text-content-main">
          <Layers size={14} className="text-primary" />
          <span>Kolhapur District Weather GIS</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-content-secondary border-t border-gray-100 pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1565C0] inline-block border border-white"></span>
            <span>Rainfall Level</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C62828] inline-block border border-white"></span>
            <span>Threshold Triggered (≥ {thresholdMm} mm)</span>
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Fallback View if token is not active */}
      {mapError && (
        <div className="absolute inset-0 bg-[#F7F9FA] flex flex-col items-center justify-center p-6 text-center z-20 overflow-y-auto">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-priority-warning mb-2">
            <AlertTriangle size={20} />
          </div>
          <h4 className="text-sm font-bold text-content-main mb-1">GIS Reanalysis Map Matrix</h4>
          <p className="text-[11px] text-content-secondary max-w-md mb-3">{mapError}</p>

          <div className="w-full max-w-xl bg-white rounded-md border border-border-default p-3 shadow-subtle text-left">
            <div className="text-xs font-semibold text-content-main mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CloudRain size={14} className="text-primary" />
                <span>Computed Rainfall by Weather Reference Point:</span>
              </span>
              <span className="text-[10px] text-content-secondary font-mono">
                Threshold: {thresholdMm} mm
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(locationsData || [
                { locationName: 'Kolhapur', latitude: 16.705, longitude: 74.243 },
                { locationName: 'Kagal', latitude: 16.576, longitude: 74.314 },
                { locationName: 'Panhala', latitude: 16.810, longitude: 74.110 },
                { locationName: 'Shirol', latitude: 16.737, longitude: 74.597 },
                { locationName: 'Gadhinglaj', latitude: 16.226, longitude: 74.346 }
              ]).map((loc) => {
                const isTriggered = loc.thresholdExceeded || (loc.cumulativeRainfallMm && loc.cumulativeRainfallMm >= thresholdMm);
                return (
                  <div 
                    key={loc.locationName} 
                    className={`p-2 rounded border flex flex-col justify-between ${
                      isTriggered 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-[#F7F9FA] border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-content-main">{loc.locationName}</span>
                      {isTriggered ? (
                        <span className="text-[10px] font-bold text-priority-high bg-white px-1.5 py-0.5 rounded border border-red-200">
                          TRIGGERED
                        </span>
                      ) : (
                        <span className="text-[10px] text-content-secondary">Normal</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-content-secondary">
                        {loc.cumulativeRainfallMm !== undefined && loc.cumulativeRainfallMm !== null
                          ? `${loc.cumulativeRainfallMm} mm` 
                          : 'Awaiting analysis'}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
