import { apiService } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import type { CityOption } from '../types';

export function WeatherForecast({ currentCity }: { currentCity: CityOption | null }) {
    const [weather, setWeather] = useState<any | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useEffect(() => {
        if (!currentCity) {
            return;
        }
        const fetchWeather = async () => {
            try {
                setRefreshing(true);
                setWeather(await apiService.getWeather());
            } catch (error) {
                console.error('Error fetching weather:', error);
            } finally {
                setRefreshing(false);
            }
        };
        fetchWeather();
        const interval = setInterval(fetchWeather, 180000); // 3 minutes
        return () => clearInterval(interval);
    }, [currentCity]);

    return (
        <div className="card">
            <div className="card-body">
                <h1 className="h5 card-title">Current Weather</h1>
                <p className="text-muted small">{refreshing ? 'Refreshing…' : 'Last updated ' + new Date().toLocaleString()}</p>
                <p className="mb-1">Temperature: {weather?.current?.temperature_2m} {weather?.current_units?.temperature_2m}</p>
                <p className="mb-1">Precipitation: {weather?.current?.precipitation} {weather?.current_units?.precipitation}</p>
                <p className="mb-1">Humidity: {weather?.current?.relative_humidity_2m} {weather?.current_units?.relative_humidity_2m}</p>
                <p className="mb-1">Wind Speed: {weather?.current?.wind_speed_10m} {weather?.current_units?.wind_speed_10m}</p>
                <p className="mb-1">Wind Direction: {weather?.current?.wind_direction_10m} {weather?.current_units?.wind_direction_10m}</p>
            </div>
        </div>
    );
}