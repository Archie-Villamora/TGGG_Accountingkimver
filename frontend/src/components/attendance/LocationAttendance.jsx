import { useEffect, useMemo, useState } from "react";
import { CheckCircle, MapPin, XCircle } from "lucide-react";
import attendanceLocations from "../../configs/attendanceLocations";

const RADIO_OPTIONS = [
  { value: "office", label: "Office" },
  { value: "construction", label: "Construction Site or Outside Meeting" },
];

const toRad = (value) => (value * Math.PI) / 180;

const calculateDistanceMeters = (lat1, lng1, lat2, lng2) => {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const earthRadius = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const StatusChip = ({ success, text }) => {
  const base = "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border";
  if (success) {
    return (
      <div className={`${base} bg-emerald-500/10 text-emerald-300 border-emerald-500/20`}>
        <CheckCircle className="h-4 w-4" />
        <span>{text}</span>
      </div>
    );
  }
  return (
    <div className={`${base} bg-red-500/10 text-red-300 border-red-500/20`}>
      <XCircle className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
};

const LocationAttendance = ({
  role,
  className = "rounded-2xl border border-white/10 bg-[#001f35]/70 p-4 sm:p-6 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.22)]",
  title = "Attendance",
  description = "Answer the office mode and capture location to enable Time In/Out.",
  onStatusChange,
}) => {
  const [mode, setMode] = useState("office");
  const [locationIn, setLocationIn] = useState(null);
  const [locationInError, setLocationInError] = useState("");
  const [locationOut, setLocationOut] = useState(null);
  const [locationOutError, setLocationOutError] = useState("");
  const [processing, setProcessing] = useState("");

  const officeConfig = attendanceLocations.mainOffice || {
    name: "Office",
    latitude: 0,
    longitude: 0,
    radius: 1000,
  };
  const officeLabel = officeConfig?.name ?? "Office";

  const requestCoordinates = (setter, errorSetter) => {
    if (!navigator.geolocation) {
      errorSetter("Geolocation is not supported by your browser.");
      return;
    }
    errorSetter("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setter({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        errorSetter("Unable to retrieve location. Please enable location access.");
      }
    );
  };

  const officeDistanceIn = useMemo(() => {
    if (!locationIn) return null;
    return calculateDistanceMeters(
      locationIn.latitude,
      locationIn.longitude,
      officeConfig.latitude,
      officeConfig.longitude
    );
  }, [locationIn, officeConfig]);

  const officeDistanceOut = useMemo(() => {
    if (!locationOut) return null;
    return calculateDistanceMeters(
      locationOut.latitude,
      locationOut.longitude,
      officeConfig.latitude,
      officeConfig.longitude
    );
  }, [locationOut, officeConfig]);

  const inRangeIn = mode === "office" ? officeDistanceIn != null && officeDistanceIn <= officeConfig.radius : true;
  const inRangeOut = mode === "office" ? officeDistanceOut != null && officeDistanceOut <= officeConfig.radius : true;

  const canTimeIn = Boolean(locationIn) && inRangeIn;
  const canTimeOut = Boolean(locationOut) && inRangeOut;

  useEffect(() => {
    onStatusChange?.({ ready: canTimeIn || canTimeOut, locationIn, locationOut });
  }, [canTimeIn, canTimeOut, locationIn, locationOut, onStatusChange]);

  const fallbackLocation = useMemo(
    () => ({
      latitude: officeConfig.latitude,
      longitude: officeConfig.longitude,
    }),
    [officeConfig.latitude, officeConfig.longitude]
  );

  const mapCenter = locationOut || locationIn || fallbackLocation;

  const mapBounds = useMemo(() => {
    const lat = locationOut?.latitude ?? locationIn?.latitude ?? fallbackLocation.latitude;
    const lng = locationOut?.longitude ?? locationIn?.longitude ?? fallbackLocation.longitude;
    const radiusOffset = Math.max(0.001, (officeConfig.radius || 500) / 111000);
    return {
      minLat: lat - radiusOffset,
      maxLat: lat + radiusOffset,
      minLng: lng - radiusOffset,
      maxLng: lng + radiusOffset,
    };
  }, [
    locationIn?.latitude,
    locationIn?.longitude,
    locationOut?.latitude,
    locationOut?.longitude,
    fallbackLocation.latitude,
    fallbackLocation.longitude,
    officeConfig.radius,
  ]);

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.minLng},${mapBounds.minLat},${mapBounds.maxLng},${mapBounds.maxLat}&layer=mapnik&marker=${mapCenter.latitude ?? fallbackLocation.latitude},${mapCenter.longitude ?? fallbackLocation.longitude}`;

  const handleTimeAction = (type) => {
    if ((type === "in" && !canTimeIn) || (type === "out" && !canTimeOut)) return;
    setProcessing(type);
    setTimeout(() => {
      setProcessing("");
    }, 1000);
  };

  const renderLocationRow = (label, location, error, handler, distance, rangeOk) => (
    <div>
      <p className="text-white/60 text-sm font-semibold">{label}</p>
      {location && rangeOk && (
        <StatusChip
          success
          text={`Captured (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`}
        />
      )}
      {location && !rangeOk && (
        <StatusChip
          success={false}
          text={`Outside ${officeLabel} radius (${distance ? distance.toFixed(0) : "-"}m)`}
        />
      )}
      {error && <StatusChip success={false} text={error} />}
      {!location && !error && (
        <StatusChip success={false} text="Location not captured yet" />
      )}
      <button
        type="button"
        onClick={handler}
        className="mt-2 w-full rounded-xl border border-[#FF7120]/40 bg-[#FF7120]/10 px-4 py-2 text-sm font-semibold text-[#FF7120] hover:bg-[#FF7120]/20 transition"
      >
        Scan location now
      </button>
    </div>
  );

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="text-white/60 text-sm">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-xs uppercase tracking-[0.3em]">Mode</p>
          <p className="text-white/60 text-sm">{mode === "office" ? "Office" : "Construction Site or Outside Meeting"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {RADIO_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              mode === option.value
                ? "border-[#FF7120]/70 bg-[#FF7120]/10 text-white"
                : "border-white/15 bg-transparent text-white/60 hover:border-white/40"
            }`}
          >
            <input
              type="radio"
              name="attendance-mode"
              value={option.value}
              className="hidden"
              checked={mode === option.value}
              onChange={() => setMode(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {renderLocationRow(
          "Time In Location",
          locationIn,
          locationInError,
          () => requestCoordinates(setLocationIn, setLocationInError),
          officeDistanceIn,
          inRangeIn
        )}
        {renderLocationRow(
          "Time Out Location",
          locationOut,
          locationOutError,
          () => requestCoordinates(setLocationOut, setLocationOutError),
          officeDistanceOut,
          inRangeOut
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-white text-sm font-semibold">Map view</p>
          <p className="text-xs text-white/60 uppercase tracking-[0.3em]">Live</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
          <iframe
            title="Attendance location map"
            className="w-full h-60 sm:h-64 border-0"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-xs text-white/50">
          {locationIn || locationOut
            ? "Showing the captured coordinates. Drag or zoom to inspect the point."
            : `Displaying ${officeLabel} as a reference area before capture.`}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!canTimeIn || processing === "in"}
          onClick={() => {
            handleTimeAction("in");
          }}
          className={[
            "w-full sm:w-auto rounded-xl px-5 py-3 font-semibold text-white transition shadow-[0_12px_24px_rgba(0,0,0,0.22)]",
            !canTimeIn || processing === "in"
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-[#FF7120] hover:brightness-95",
          ].join(" ")}
        >
          {processing === "in" ? "Processing..." : "Time In"}
        </button>
        <button
          type="button"
          disabled={!canTimeOut || processing === "out"}
          onClick={() => {
            handleTimeAction("out");
          }}
          className={[
            "w-full sm:w-auto rounded-xl px-5 py-3 font-semibold text-white transition shadow-[0_12px_24px_rgba(0,0,0,0.22)]",
            !canTimeOut || processing === "out"
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-[#FF7120] hover:brightness-95",
          ].join(" ")}
        >
          {processing === "out" ? "Processing..." : "Time Out"}
        </button>
      </div>

      <div className="mt-3 text-xs text-white/50">
        {mode === "office" ? (
          <p>
            Geofence radius <strong>{officeConfig.radius}m</strong> around {officeLabel}. You can time in and out when your
            location is within range.
          </p>
        ) : (
          <p>
            Tracking on construction site or outside meeting: location is required, but range checks are skipped.
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationAttendance;
