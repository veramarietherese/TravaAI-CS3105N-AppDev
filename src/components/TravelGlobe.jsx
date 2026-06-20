import { useEffect, useRef, useState } from "react"
import Globe from "react-globe.gl"
import * as THREE from "three"
import { feature } from "topojson-client"

const cities = [
  { name: "Cebu", country: "Philippines", lat: 10.3157, lng: 123.8854, color: "#7c5cff" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, color: "#ff4fa3" },
  { name: "Seoul", country: "Korea", lat: 37.5665, lng: 126.978, color: "#4a8dff" },
  { name: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889, color: "#7c5cff" },
]

const arcs = [
  { startLat: 10.3157, startLng: 123.8854, endLat: 35.6762, endLng: 139.6503 },
  { startLat: 35.6762, startLng: 139.6503, endLat: 37.5665, endLng: 126.978 },
  { startLat: 10.3157, startLng: 123.8854, endLat: -8.4095, endLng: 115.1889 },
]

export default function TravelGlobe() {
  const globeRef = useRef(null)
  const [countries, setCountries] = useState([])

  useEffect(() => {
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((world) => {
        setCountries(feature(world, world.objects.countries).features)
      })
      .catch(() => setCountries([]))
  }, [])

  useEffect(() => {
    if (!globeRef.current) return

    const controls = globeRef.current.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.45
    controls.enableZoom = false
    controls.enablePan = false

    globeRef.current.pointOfView(
      { lat: 20, lng: 110, altitude: 1.65 },
      900
    )

    const material = globeRef.current.globeMaterial()
    material.color = new THREE.Color("#8ea8ff")
    material.emissive = new THREE.Color("#94aaff")
    material.emissiveIntensity = 0.4
    material.shininess = 0.9
  }, [countries])

  return (
    <div className="premium-globe-wrap">
      <div className="premium-globe-glow" />

      <Globe
        ref={globeRef}
        width={760}
        height={430}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.18}
        polygonsData={countries}
        polygonCapColor={() => "rgba(255,255,255,0.82)"}
        polygonSideColor={() => "rgba(255,255,255,0.08)"}
        polygonStrokeColor={() => "rgba(255,255,255,0.14)"}
        polygonAltitude={0.008}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={() => "rgba(255,255,255,0.95)"}
        arcDashLength={0.08}
        arcDashGap={0.035}
        arcDashAnimateTime={2600}
        arcStroke={1.45}
        arcAltitude={0.2}
        pointsData={cities}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d) => d.color}
        pointAltitude={0.035}
        pointRadius={0.36}
        labelsData={cities}
        labelLat="lat"
        labelLng="lng"
        labelAltitude={0.08}
        labelSize={1.05}
        labelDotRadius={0.28}
        labelColor={(d) => d.color}
        labelText={(d) => `${d.name}\n${d.country}`}
        labelResolution={2}
      />
    </div>
  )
}