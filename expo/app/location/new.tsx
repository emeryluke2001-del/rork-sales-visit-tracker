import React from "react";
import { router } from "expo-router";
import LocationForm from "@/components/LocationForm";
import { useLocations } from "@/providers/LocationsProvider";

export default function NewLocationScreen() {
  const { addLocation } = useLocations();

  return (
    <LocationForm
      submitLabel="Add Location"
      onSubmit={(value) => {
        addLocation(value);
        router.back();
      }}
    />
  );
}
