const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
const weatherData = require("./example.json");

app.get("/weather", (req, res) => {
  const { lat, lon } = req.query;
  res.json({
    daily: parseDailyWeather(weatherData),
    current: parseCurrentWeather(weatherData),
    hourly: parseHourlyWeather(weatherData),
  });
});

function parseCurrentWeather({ current, daily }) {
  const { temp: currentTemp, weather, wind_speed } = current;
  const { pop, temp, feels_like } = daily[0];

  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(temp.max),
    lowTemp: Math.round(temp.min),
    highFeelsLike: Math.round(Math.max(...Object.values(feels_like))),
    lowFeelsLike: Math.round(Math.min(...Object.values(feels_like))),
    windSpeed: Math.round(wind_speed),
    precip: Math.round(pop * 100),
    icon: weather[0].icon,
    description: weather[0].description,
  };
}
function parseDailyWeather({ daily }) {
  return daily.slice(1).map((day) => {
    return {
      timestamp: day.dt * 1000,
      icon: day.weather[0].icon,
      temp: Math.round(day.temp.day),
    };
  });
}
const HOURS_IN_SECONDS = 3600;
function parseHourlyWeather({ hourly, current }) {
  return hourly
    .filter((hour) => hour.dt > current.dt - HOURS_IN_SECONDS)
    .map((hour) => {
      return {
        timestamp: hour.dt * 1000,
        icon: hour.weather[0].icon,
        temp: Math.round(hour.temp),
        feelsLike: Math.round(hour.feels_like),
        windspeed: Math.round(hour.wind_speed),
        precip: Math.round(hour.pop * 100),
      };
    });
}
app.listen(3001);
