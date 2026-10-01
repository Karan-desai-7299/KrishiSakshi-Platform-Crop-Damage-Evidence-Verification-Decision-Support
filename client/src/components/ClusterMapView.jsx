import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Layers, MapPin, AlertTriangle, Cpu, Users, Eye } from 'lucide-react';

export default function ClusterMapView({
  clusters = [],
  selectedClusterId = null,
  onSelectCluster = () => {}
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Cleanup markers
  const clearMarkers = () => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!token || token.includes('placeholder')) {
      setMapError('A valid Mapbox public token is required in client/.env (VITE_MAPBOX_TOKEN). Displaying fallback GIS cluster matrix.');
      return;
    }

    try {
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [74.35, 16.68], // Kolhapur center
        zoom: 9.5
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        renderClusterMarkers(map);
      });

      map.on('error', (e) => {
        console.warn('Mapbox error:', e);
        setMapError('Unable to load Mapbox tiles. Falling back to cluster coordinate matrix.');
      });

      mapRef.current = map;

      return () => {
        clearMarkers();
        map.remove();
      };
    } catch (err) {
      console.error('Mapbox init error:', err);
      setMapError('Mapbox initialization error: ' + err.message);
    }
  }, [token]);

  // Re-render markers whenever clusters or selectedClusterId changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderClusterMarkers(mapRef.current);
    }
  }, [clusters, selectedClusterId]);

  const renderClusterMarkers = (map) => {
    clearMarkers();

    clusters.forEach(cluster => {
      const isSelected = cluster.clusterId === selectedClusterId;
      const isHigh = cluster.priorityLevel === 'HIGH';
      const isMedium = cluster.priorityLevel === 'MEDIUM';

      // Colors matching Maharashtra gov priority standard
      const color = isHigh ? '#C62828' : isMedium ? '#E65100' : '#455A64';
      const bgColor = isHigh ? '#FFEBEE' : isMedium ? '#FFF3E0' : '#ECEFF1';
      const size = isHigh ? 30 : isMedium ? 26 : 22;

      const el = document.createElement('div');
      el.className = 'cluster-marker-pin';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = color;
      el.style.border = isSelected ? '3px solid #0D47A1' : '2px solid #FFFFFF';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = '#FFFFFF';
      el.style.fontSize = '11px';
      el.style.fontWeight = 'bold';
      el.style.cursor = 'pointer';
      el.style.boxShadow = isSelected 
        ? '0 0 14px rgba(13, 71, 161, 0.9)' 
        : isHigh 
          ? '0 0 10px rgba(198, 40, 40, 0.6)' 
          : '0 2px 5px rgba(0,0,0,0.25)';
      el.innerText = cluster.reportCount || '1';

      const clusterCoords = cluster.center?.coordinates || cluster.centroid?.coordinates || [74.35, 16.68];

      // Popup
      const popupHtml = `
        <div style="font-family: inherit; padding: 6px; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-weight: 700; color: #263238; font-size: 12px;">${cluster.clusterId}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${bgColor}; color: ${color};">
              ${cluster.priorityLevel} (${cluster.priorityScore})
            </span>
          </div>
          <div style="font-size: 11px; color: #455A64; margin-top: 4px;">
            <strong>Crop:</strong> ${cluster.dominantCrop} • ${cluster.dominantDamageType || 'Crop Loss'}
          </div>
          <div style="font-size: 11px; color: #455A64; margin-top: 2px;">
            <strong>Reports:</strong> ${cluster.reportCount} farms
          </div>
          <div style="font-size: 10px; color: #78909C; margin-top: 2px;">
            Centroid: [${clusterCoords[0].toFixed(3)}, ${clusterCoords[1].toFixed(3)}]
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(popupHtml);

      el.addEventListener('click', () => {
        onSelectCluster(cluster);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(clusterCoords)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  return (
    <div className="relative w-full h-[460px] rounded-card overflow-hidden border border-border-default bg-white shadow-subtle">
      {/* GIS Legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 px-3 py-2 rounded-md border border-border-default text-xs shadow-sm flex flex-col gap-1 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 font-bold text-content-main">
          <Layers size={14} className="text-primary" />
          <span>Potential Damage Clusters (GIS)</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-content-secondary border-t border-gray-100 pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C62828] inline-block"></span>
            <span>High (≥ 70)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E65100] inline-block"></span>
            <span>Medium (40-69)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#455A64] inline-block"></span>
            <span>Low (&lt; 40)</span>
          </span>
        </div>
      </div>

      {/* Mapbox Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Fallback Grid View if Mapbox token is not loaded */}
      {mapError && (
        <div className="absolute inset-0 bg-[#F7F9FA] flex flex-col items-center justify-center p-6 text-center z-20 overflow-y-auto">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-priority-warning mb-2">
            <AlertTriangle size={20} />
          </div>
          <h4 className="text-sm font-bold text-content-main mb-1">Kolhapur Spatial Cluster Matrix</h4>
          <p className="text-[11px] text-content-secondary max-w-md mb-3">{mapError}</p>

          <div className="w-full max-w-2xl bg-white rounded-md border border-border-default p-4 shadow-subtle text-left max-h-72 overflow-y-auto">
            <div className="text-xs font-bold text-content-main mb-2 flex items-center justify-between">
              <span>Detected Clusters ({clusters.length} active):</span>
              <span className="text-[10px] text-content-secondary">Click row to inspect cluster</span>
            </div>

            <div className="space-y-2">
              {clusters.map((c) => {
                const isSelected = c.clusterId === selectedClusterId;
                const isHigh = c.priorityLevel === 'HIGH';
                const coords = c.center?.coordinates || c.centroid?.coordinates || [74.35, 16.68];
                return (
                  <div
                    key={c.clusterId}
                    onClick={() => onSelectCluster(c)}
                    className={`p-2.5 rounded border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-blue-50/50 shadow-sm'
                        : isHigh
                          ? 'border-red-200 bg-red-50/30 hover:bg-red-50'
                          : 'border-border-default bg-[#F7F9FA] hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isHigh ? 'bg-priority-high' : c.priorityLevel === 'MEDIUM' ? 'bg-amber-600' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-bold text-content-main">{c.clusterId}</div>
                        <div className="text-[11px] text-content-secondary">
                          {c.dominantCrop} • {c.reportCount} reports • Centroid: [{coords[0]?.toFixed(2)}, {coords[1]?.toFixed(2)}]
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isHigh 
                          ? 'text-priority-high bg-white border-red-200' 
                          : 'text-amber-800 bg-white border-amber-200'
                      }`}>
                        Score {c.priorityScore}
                      </span>
                      <Eye size={14} className="text-primary" />
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
