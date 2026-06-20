import { useEffect, useMemo, useRef, useState } from "react"
import Globe from "react-globe.gl"
import { feature } from "topojson-client"

export default function TravelGlobe({ flights = [] }) {
  const wrapRef = useRef(null)
  const globeRef = useRef(null)
  const [countries, setCountries] = useState([])
  const [size, setSize] = useState({ width: 360, height: 330 })

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width || 360

      setSize({
        width: Math.max(width * 1.25, 360),
        height: Math.min(Math.max(width * 0.72, 300), 430),
      })
    })

    if (wrapRef.current) observer.observe(wrapRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((world) => {
        setCountries(feature(world, world.objects.countries).features)
      })
      .catch(() => setCountries([]))
  }, [])

  const arcs = useMemo(() => {
    return flights.map((flight) => ({
      startLat: flight.origin.lat,
      startLng: flight.origin.lng,
      endLat: flight.destination.lat,
      endLng: flight.destination.lng,
    }))
  }, [flights])

  const points = useMemo(() => {
    const map = new Map()

    flights.forEach((flight) => {
      map.set(flight.origin.code, flight.origin)
      map.set(flight.destination.code, flight.destination)
    })

    return [...map.values()].map((airport, index) => ({
      ...airport,
      color: ["#7c5cff", "#ff4fa3", "#4a8dff"][index % 3],
      label: `${airport.city}\n${airport.country}`,
    }))
  }, [flights])

  useEffect(() => {
    if (!globeRef.current) return

    const controls = globeRef.current.controls?.()

    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.35
      controls.enableZoom = false
      controls.enablePan = false
    }

    globeRef.current.pointOfView?.(
      { lat: 18, lng: 112, altitude: 1.85 },
      900
    )
  }, [countries, size])

  return (
    <div className="premium-globe-wrap" ref={wrapRef}>
      <div className="premium-globe-glow" />

      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={null}
        bumpImageUrl={null}
        showGlobe={false}
        showAtmosphere
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.28}
        polygonsData={countries}
        polygonCapColor={() => "rgba(255,255,255,0.78)"}
        polygonSideColor={() => "rgba(255,255,255,0.05)"}
        polygonStrokeColor={() => "rgba(255,255,255,0.22)"}
        polygonAltitude={0.006}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={() => "rgba(255,255,255,0.95)"}
        arcDashLength={0.07}
        arcDashGap={0.04}
        arcDashAnimateTime={2400}
        arcStroke={1.35}
        arcAltitude={0.18}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d) => d.color}
        pointAltitude={0.04}
        pointRadius={0.34}
        labelsData={points}
        labelLat="lat"
        labelLng="lng"
        labelAltitude={0.075}
        labelText={(d) => d.label}
        labelColor={(d) => d.color}
        labelSize={0.9}
        labelDotRadius={0.25}
      />
    </div>
  )
}

import world from "../data/countries-110m.json"

