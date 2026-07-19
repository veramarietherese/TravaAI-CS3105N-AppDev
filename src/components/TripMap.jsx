import { useEffect, useMemo, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

export default function TripMap({ stops = [] }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  const validStops = useMemo(() => {
    return stops.filter((stop) => stop.lat && stop.lng)
  }, [stops])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [139.6503, 35.6762],
      zoom: 4,
      attributionControl: false,
    })

    mapInstance.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right",
    )
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    if (!validStops.length) return

    const coordinates = validStops.map((stop) => [Number(stop.lng), Number(stop.lat)])

    validStops.forEach((stop, index) => {
      const markerElement = document.createElement("div")
      markerElement.className = "trip-map-marker"
      markerElement.innerHTML = `
        <span>${index + 1}</span>
        <strong>${stop.assetEmoji || "📍"}</strong>
      `

      const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat([Number(stop.lng), Number(stop.lat)])
        .setPopup(
          new maplibregl.Popup({ offset: 22 }).setHTML(`
            <strong>${stop.title || stop.city || "Trip Stop"}</strong>
            <p>${stop.place || ""}</p>
          `),
        )
        .addTo(map)

      markersRef.current.push(marker)
    })

    const bounds = new maplibregl.LngLatBounds()

    coordinates.forEach((coordinate) => bounds.extend(coordinate))

    map.fitBounds(bounds, {
      padding: 70,
      maxZoom: 10,
      duration: 900,
    })

    const drawRoute = () => {
      if (map.getSource("trip-route")) {
        map.getSource("trip-route").setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
        })
        return
      }

      map.addSource("trip-route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      })

      map.addLayer({
        id: "trip-route-line",
        type: "line",
        source: "trip-route",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#7657ff",
          "line-width": 4,
          "line-dasharray": [2, 2],
        },
      })
    }

    if (map.isStyleLoaded()) {
      drawRoute()
    } else {
      map.once("load", drawRoute)
    }
  }, [validStops])

  return <div ref={mapRef} className="trip-map-real" />
}