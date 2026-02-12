import { apiService } from '../services/api';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import type { CityOption } from '../types';

export function CitySelector({ setCurrentCity }: { setCurrentCity: (city: CityOption) => void }) {
  const [singleSelections, setSingleSelections] = useState<CityOption[]>([]);
  const [options, setOptions] = useState<CityOption[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue.length < 1) {
      return;
    }

    const fetchCities = async () => {
      try {
        const cities = await apiService.getCitiesAutocomplete(inputValue);
        setOptions(cities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    const timeoutId = setTimeout(fetchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleCitySelect = async (selected: CityOption[]) => {
    setSingleSelections(selected);

    if (selected.length > 0) {
      const city = selected[0];

      try {
        await apiService.setCurrentCity(city);
        setCurrentCity(city);
      } catch (error) {
        console.error('Failed to save city:', error);
      }
    }
  };

  return (
    <>
      <Form.Group>
        <Form.Label>Select a City</Form.Label>
        <Typeahead
          id="basic-typeahead-single"
          labelKey="cityName"
          onChange={handleCitySelect}
          onInputChange={(text) => setInputValue(text)}
          options={options}
          placeholder="Type to search cities..."
          selected={singleSelections}
        />
        {singleSelections.length > 0 && (
          <small className="text-muted">Selected: {singleSelections[0].cityName}</small>
        )}
      </Form.Group>
    </>
  )
};