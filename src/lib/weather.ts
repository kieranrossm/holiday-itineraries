type WeatherConfig = {
  enabled?: boolean;
  latitude?: number;
  longitude?: number;
  iconSetRef?: WeatherIconSource;
  iconSet?: WeatherIconSource;
};

type WeatherIconSource = {
  sunnyUrl?: string;
  partlyCloudyUrl?: string;
  cloudyUrl?: string;
  fogUrl?: string;
  drizzleUrl?: string;
  rainUrl?: string;
  heavyRainUrl?: string;
  snowUrl?: string;
  thunderstormUrl?: string;
};

type TripWithWeather = {
  weatherConfig?: WeatherConfig;
};

export const hasWeatherConfig = (weatherConfig: WeatherConfig | undefined) => {
  return Boolean(
    weatherConfig?.enabled &&
    typeof weatherConfig.latitude === "number" &&
    typeof weatherConfig.longitude === "number"
  );
};

export const getWeatherIconSet = (iconSet: WeatherIconSource | undefined) => {
  const source = iconSet || {};

  return {
    sunnyUrl: source.sunnyUrl || "",
    partlyCloudyUrl: source.partlyCloudyUrl || "",
    cloudyUrl: source.cloudyUrl || "",
    fogUrl: source.fogUrl || "",
    drizzleUrl: source.drizzleUrl || "",
    rainUrl: source.rainUrl || "",
    heavyRainUrl: source.heavyRainUrl || "",
    snowUrl: source.snowUrl || "",
    thunderstormUrl: source.thunderstormUrl || "",
  };
};

export const getSharedWeatherIconSet = (trip: TripWithWeather) => {
  return getWeatherIconSet(
    trip.weatherConfig?.iconSetRef ||
    trip.weatherConfig?.iconSet
  );
};
