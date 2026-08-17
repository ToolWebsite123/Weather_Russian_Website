import { resolveCity, loadCityWeather } from "./lib/weather/city-page.js";

async function main() {
  console.log("Resolving weather-faisalabad-saddar-tehsil...");
  const city = await resolveCity("weather-faisalabad-saddar-tehsil");
  console.log("Resolved city:", city);

  const data = await loadCityWeather("weather-faisalabad-saddar-tehsil");
  console.log("Loaded weather data success?", !!data);
}

main().catch(console.error);
