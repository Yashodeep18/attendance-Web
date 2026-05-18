const LocationPermissionMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-semibold">Location message</p>
      <p>{message}</p>
      <p className="mt-2 text-xs">
        Browser location permission is required because clock-in and clock-out are allowed only within office range.
      </p>
    </div>
  );
};

export default LocationPermissionMessage;
