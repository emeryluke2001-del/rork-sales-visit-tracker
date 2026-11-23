import React from "react";
import { useLocalSearchParams, router } from "expo-router";
import LocationForm from "@/components/LocationForm";
import { useLocations } from "@/providers/LocationsProvider";

export default function NewLocationScreen() {
  const { addLocation } = useLocations();
  const { account } = useLocalSearchParams<{ account?: string }>();
  const asAccount = account === "1";

  return (
    <LocationForm
      submitLabel={asAccount ? "Add Account" : "Add Location"}
      showFirstVisit
      onSubmit={(value, firstVisitNote) => {
        addLocation(
          asAccount
            ? { ...value, isAccount: true, accountSince: new Date().toISOString() }
            : value,
          firstVisitNote
        );
        router.back();
      }}
    />
  );
}
