export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    reject(new Error("Location permission denied. Please allow location access."));
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    reject(new Error("Location information is unavailable."));
                } else if (error.code === error.TIMEOUT) {
                    reject(new Error("Location request timed out. Please try again."));
                } else {
                    reject(new Error("Unable to get current location."));
                }
            }, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    });
};