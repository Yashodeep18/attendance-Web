export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const earthRadiusMeters = 6371000;
  const toRadians = (degree) => (degree * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
};

export const validateCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { isValid: false, message: "Latitude and longitude must be numbers." };
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return { isValid: false, message: "Latitude or longitude is outside valid range." };
  }

  return { isValid: true, latitude: lat, longitude: lon };
};

export const validateOfficeLocation = ({ latitude, longitude, settings }) => {
  const coordinateCheck = validateCoordinates(latitude, longitude);

  if (!coordinateCheck.isValid) {
    return coordinateCheck;
  }

  const distanceFromOfficeMeters = calculateDistanceMeters(
    coordinateCheck.latitude,
    coordinateCheck.longitude,
    settings.officeLatitude,
    settings.officeLongitude
  );

  const isInsideOfficeRange = distanceFromOfficeMeters <= settings.allowedRadiusMeters;

  return {
    isValid: isInsideOfficeRange,
    latitude: coordinateCheck.latitude,
    longitude: coordinateCheck.longitude,
    distanceFromOfficeMeters: Number(distanceFromOfficeMeters.toFixed(2)),
    message: isInsideOfficeRange
      ? "Location is inside allowed office range."
      : "You are outside the allowed office location range.",
  };
};
