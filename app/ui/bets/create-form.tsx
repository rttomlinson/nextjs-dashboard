'use client';
import Link from 'next/link';
import { CurrencyDollarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useFormState } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { createBet } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import {createRoot} from 'react-dom/client';
import {APIProvider, Map, AdvancedMarker, MapControl, useMapsLibrary, ControlPosition, useMap, useAdvancedMarkerRef} from '@vis.gl/react-google-maps';

const PlaceAutocomplete = ({ onPlaceSelect }) => {
    
    const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
    const inputRef = useRef(null);
    const places = useMapsLibrary("places");
  
    useEffect(() => {
      if (!places || !inputRef.current) return;
  
      const options = {
        fields: ["geometry", "name", "formatted_address"],
      };
  
      setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
    }, [places]);
    useEffect(() => {
      if (!placeAutocomplete) return;
  
      placeAutocomplete.addListener("place_changed", () => {
        onPlaceSelect(placeAutocomplete.getPlace());
      });
    }, [onPlaceSelect, placeAutocomplete]);
    return (
      <div className="autocomplete-container">
        <input ref={inputRef} />
      </div>
    );
  };

const MapHandler = ({ place, marker, setPosition }) => {
    const map = useMap();
  
    useEffect(() => {
      if (!map || !place || !marker || !setPosition) return;
  
      if (place.geometry?.viewport) {
        map.fitBounds(place.geometry?.viewport);
      }
  
      marker.position = place.geometry?.location;
      setPosition({lat: place.geometry?.location.lat(), lng: place.geometry?.location.lng()});
    }, [map, place, marker, setPosition]);
    return null;
  };

const MapControlWrapper = ({onPlaceSelect}) => {
    const map = useMap();
  
    useEffect(() => {
      if (!map) return;
    }, [map, onPlaceSelect])
    // unstable_noStore();
    return (
        // <PlaceAutocomplete onPlaceSelect={onPlaceSelect} />
        <MapControl position={ControlPosition.TOP}>
            <div className="autocomplete-control">
                <PlaceAutocomplete onPlaceSelect={onPlaceSelect} />
            </div>
        </MapControl>
    )
}

export default function Form() {
    const [selectedPlace, setSelectedPlace] = useState(null);

    const initialState = { errors: {}, message: null }
    const [state, dispatch] = useFormState(createBet, initialState);
    const [position, setPosition] = useState({lat: 0, lng: 0});
    const [markerRef, marker] = useAdvancedMarkerRef();
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");


    // get offset from browser
    var offset = new Date().getTimezoneOffset();
    console.log(offset);

    return (
        <form action={dispatch}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">

                {/* Bet Amount */}
                <div className="mb-4">
                    <label htmlFor="amount" className="mb-2 block text-sm font-medium">
                        Choose an amount
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            placeholder="Enter USD amount"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby='amount-error'
                        />
                        <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>
                    {/* <div id="amount-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.amount &&
                        state.errors.amount.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                            {error}
                            </p>
                        ))}
                    </div> */}
                </div>

                {/* Bet Location */}
                <div className="mb-4">
                    <label htmlFor="location" className="mb-2 block text-sm font-medium">
                        Choose location (latitude, longitude)
                    </label>
                    <div className="flex relative mt-2 rounded-md">
                        <div className="relative">
                        <input
                            id="latitude"
                            name="latitude"
                            type="string"
                            placeholder="Enter latitude"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby='latitude-error'
                            defaultValue={position.lat || ""}
                        />
                        <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                        <div className="relative">
                        <input
                            id="longitude"
                            name="longitude"
                            type="string"
                            placeholder="Enter longitude"
                            className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            aria-describedby='longitude-error'
                            defaultValue={position.lng || ""}
                        />
                        <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                        </div>
                    </div>
                </div>
                {/* Bet Map Position */}
                <div className="mb-4">
                    <label htmlFor="map" className="mb-2 block text-sm font-medium">
                        Map
                    </label>
                    <div className="flex relative mt-2 rounded-md">
                        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
    >
                            <Map
                            style={{width: '100vw', height: '100vh'}}
                            defaultCenter={position}
                            defaultZoom={5}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                            onClick={(e) => {
                                console.log("clicked")
                                console.log(e)
                                console.log(e.detail.latLng.lat)
                                console.log(e.detail.latLng.lng)
                                marker.position = {lat: e.detail.latLng.lat, lng: e.detail.latLng.lng}

                                setPosition({lat: e.detail.latLng.lat, lng: e.detail.latLng.lng})
                                
                            }}
                            mapId="74b9751a37ff6a2b"
                            >
                                {/* red default marker */}
                                <AdvancedMarker ref={markerRef} position={null} />

                                {/* <AdvancedMarker position={position} /> */}
                            </Map>
                            <MapControlWrapper onPlaceSelect={setSelectedPlace}></MapControlWrapper>
                            {/* <MapControl position={ControlPosition.TOP}>
                                <div className="autocomplete-control">
                                    <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
                                </div>
                            </MapControl> */}
                            <MapHandler place={selectedPlace} marker={marker} setPosition={setPosition}/>
                        </APIProvider>
                    </div>
                {/* <div id="latitude-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.latitude &&
                    state.errors.latitude.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div> */}
                {/* <div id="longitude-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.longitude &&
                    state.errors.longitude.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div> */}
                </div>

                {/* Bet Datetime-local */}
                <div className="mb-4">
                <label htmlFor="duration" className="mb-2 block text-sm font-medium">
                    Enter date and time
                </label>
                <div className="relative mt-2 rounded-md">
                    <div className="relative">
                    <input
                        id="datetime-local"
                        name="datetime-local"
                        type="datetime-local"
                        placeholder="Enter date and time"
                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                        aria-describedby='datetime-local-error'
                    />
                    <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div>
                </div>
                {/* <div id="location-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.location &&
                    state.errors.location.map((error: string) => (
                        <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div> */}
                </div>

                <input type="hidden" id="offset" name="offset" value={offset} />


            </div>

            <div className="mt-6 flex justify-center gap-4">
                <Link
                href="/dashboard/bets"
                className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                Cancel
                </Link>
                <Button type='submit'>
                    Create Bet
                </Button>
                {/* <button className='flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
                        type="submit">
                    Create Bet
                </button> */}
            </div>
        </form>
    )
}