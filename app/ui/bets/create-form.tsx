'use client';

import PaidIcon from '@mui/icons-material/Paid';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Alert from '@mui/material/Alert';

import { useState, useRef, useEffect, useActionState } from 'react';
import { createBet } from '@/app/lib/actions';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapControl,
  useMapsLibrary,
  ControlPosition,
  useMap,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';

import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';

import InputAdornment from '@mui/material/InputAdornment';

const PlaceAutocomplete = ({ onPlaceSelect, setPosition }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);
  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      const location = placeAutocomplete.getPlace().geometry.location;
      const coords = { lat: location.lat(), lng: location.lng() };
      setPosition(coords);
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);
  return (
    <div className="autocomplete-container">
      <input style={{ width: '50vw' }} ref={inputRef} />
    </div>
  );
};

const MapHandler = ({ place, marker }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !marker) return;

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
    }

    marker.position = place.geometry?.location;
  }, [map, place, marker]);
  return null;
};

const MapControlWrapper = ({ onPlaceSelect, setPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
  }, [map, onPlaceSelect]);

  // Return nothing for SSR
  if (!map) return;

  return (
    <MapControl position={ControlPosition.TOP}>
      <div className="autocomplete-control">
        <PlaceAutocomplete onPlaceSelect={onPlaceSelect} setPosition={setPosition} />
      </div>
    </MapControl>
  );
};

export default function Form() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const initialState = { errors: {}, message: null };
  const [state, dispatch] = useActionState(createBet, initialState);

  // If user doesn't give access to location, just default to 0,0 (Or maybe their address if we have it to pass as props
  const [position, setPosition] = useState({ lat: 0, lng: 0 });

  const [markerRef, marker] = useAdvancedMarkerRef();
  const handleLatitudeChange = event => {
    setPosition({ lat: Number(event.target.value), lng: position.lng });
    marker.position = { lat: Number(event.target.value), lng: position.lng };
  };
  const handleLongitudeChange = event => {
    setPosition({ lng: Number(event.target.value), lat: position.lat });
    marker.position = { lng: Number(event.target.value), lat: position.lat };
  };

  // get offset from browser
  var offset = new Date().getTimezoneOffset();

  const [betType, setBetType] = React.useState('Location');

  const handleBetType = (event: SelectChangeEvent) => {
    setBetType(event.target.value);
  };

  const [checked, setChecked] = React.useState(false);

  const handleChange = () => {
    setChecked(prev => !prev);
  };

  const [placesChecked, setPlacesChecked] = React.useState(false);

  const handlePlacesChange = () => {
    setPlacesChecked(prev => !prev);
  };

  // Can I not render Until we have the position?
  useEffect(() => {
    if (!marker) {
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      marker.position = { lat: position.coords.latitude, lng: position.coords.longitude };
      setPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }, [marker]);

  return (
    <div>
      <FormControl>
        <InputLabel id="bet-type-label">Type</InputLabel>
        <Select
          labelId="bet-type-label"
          id="bet-type-select"
          // defaultValue={betType}
          value={betType}
          label="Bet type"
          onChange={handleBetType}
        >
          <MenuItem value={'Location'}>Location</MenuItem>
          <MenuItem value={'Outcome'}>Outcome</MenuItem>
        </Select>
      </FormControl>
      {betType == 'Location' ? (
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column'
          }}
          //   onSubmit={handleSubmit}
          action={dispatch}
        >
          {/* Bet Location */}
          <FormGroup>
            <div>
              <p>Where would you like to be?</p>
              <label htmlFor="location">Choose location (latitude, longitude)</label>
              <div style={{ display: 'flex' }}>
                <Box sx={{ mr: 1 }}>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    required
                    placeholder="Enter latitude"
                    aria-describedby="latitude-error"
                    value={position.lat || ''}
                    onChange={handleLatitudeChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    }
                  />
                </Box>
                <div>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    required
                    placeholder="Enter longitude"
                    aria-describedby="longitude-error"
                    value={position.lng || ''}
                    onChange={handleLongitudeChange}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    }
                  />
                </div>
              </div>
              <div id="latitude-error" aria-live="polite" aria-atomic="true">
                {state.errors?.latitude &&
                  state.errors.latitude.map((error: string) => (
                    <Alert key={error} severity="error">
                      {error}
                    </Alert>
                  ))}
              </div>
              <div id="longitude-error" aria-live="polite" aria-atomic="true">
                {state.errors?.longitude &&
                  state.errors.longitude.map((error: string) => (
                    <Alert key={error} severity="error">
                      {error}
                    </Alert>
                  ))}
              </div>
            </div>
          </FormGroup>
          <FormControl component="fieldset">
            {/* <FormLabel component="legend">Label placement</FormLabel> */}
            <FormGroup aria-label="position" row>
              <FormControlLabel
                labelPlacement="start"
                control={<Switch checked={checked} onChange={handleChange} />}
                label="Show map"
                sx={{ ml: 0 }}
              />
            </FormGroup>
          </FormControl>
          <Collapse in={checked}>
            <div>
              <label htmlFor="map">Map</label>
              <div style={{ height: '50vh' }}>
                <APIProvider
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
                >
                  <Map
                    style={{ height: '100%' }}
                    // center={position}
                    defaultCenter={position}
                    defaultZoom={10}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    onClick={e => {
                      console.log(e.detail.latLng.lat);
                      console.log(e.detail.latLng.lng);
                      setPosition({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
                      marker.position = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
                    }}
                    mapId="74b9751a37ff6a2b"
                  >
                    <AdvancedMarker ref={markerRef} position={null} />
                  </Map>
                  <MapControlWrapper onPlaceSelect={setSelectedPlace} setPosition={setPosition}></MapControlWrapper>
                  <MapHandler place={selectedPlace} marker={marker} />
                </APIProvider>
              </div>
            </div>
          </Collapse>
          <FormControl component="fieldset">
            {/* <FormLabel component="legend">Label placement</FormLabel> */}
            <FormGroup aria-label="position" row>
              <FormControlLabel
                labelPlacement="start"
                control={<Switch checked={placesChecked} onChange={handlePlacesChange} />}
                label="Show search"
                sx={{ ml: 0 }}
              />
            </FormGroup>
          </FormControl>
          <Collapse in={placesChecked}>
            <Box>
              <APIProvider
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
              >
                <div className="autocomplete-control">
                  <PlaceAutocomplete onPlaceSelect={setSelectedPlace} setPosition={setPosition} />
                </div>
              </APIProvider>
            </Box>
          </Collapse>

          {/* Bet Datetime-local */}
          <div>
            <label htmlFor="duration">Enter date and time</label>
            <div>
              <div>
                <Input
                  id="datetime-local"
                  name="datetime-local"
                  type="datetime-local"
                  required
                  placeholder="Enter date and time"
                  aria-describedby="datetime-local-error"
                  startAdornment={
                    <InputAdornment position="start">
                      <AccessTimeIcon />
                    </InputAdornment>
                  }
                  sx={{ width: '25ch' }}
                />
              </div>
            </div>
            <div id="datetime-local-error" aria-live="polite" aria-atomic="true">
              {state.errors?.datetime &&
                state.errors.datetime.map((error: string) => (
                  <Alert key={error} severity="error">
                    {error}
                  </Alert>
                ))}
            </div>
          </div>
          <div>
            <input type="hidden" id="offset" name="offset" value={offset} />
            <div id="offset-error" aria-live="polite" aria-atomic="true">
              {state.errors?.offset &&
                state.errors.offset.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    You're messing with the offset when you shouldn't be! {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Bet amount */}
          <label htmlFor="amount">Amount to bet</label>
          <Input
            id="amount"
            type="number"
            name="amount"
            required
            inputProps={{
              step: 0.5
            }}
            placeholder="Enter USD amount"
            startAdornment={
              <InputAdornment position="start">
                <PaidIcon />
              </InputAdornment>
            }
            sx={{ width: '25ch' }}
          />
          <div id="amount-error" aria-live="polite" aria-atomic="true">
            {state.errors?.amount &&
              state.errors.amount.map((error: string) => (
                <Alert key={error} severity="error">
                  {error}
                </Alert>
              ))}
          </div>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 1,
              m: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              columnGap: '10px'
            }}
          >
            <Button
              onClick={() => {
                // "/dashboard/bets"
                console.info("I'm a button.");
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create bet</Button>
          </Box>
        </Box>
      ) : betType == 'Outcome' ? (
        <div>Simple two-option outcome betting. Submit a bet type with a timeout.</div>
      ) : (
        <div>Not sure what kind of bet this is</div>
      )}
    </div>
  );
}
