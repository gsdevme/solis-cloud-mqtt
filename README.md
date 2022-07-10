# Solis Cloud MQTT

This drives a chrome browser to login into the cloud platform and extract the battery percentage.

This has been written for a Solis Hybrid inverter using the data logger to push to the cloud platform.

## Environmental Variables

```bash
SOLIS_STATION_ID=
SOLIS_EMAIL=
SOLIS_PASSWORD=
MQTT_HOST=
```

## Why?

The API has quite alot of security by obscurity so trying to directly use the API could be very brittle to change. 
Given my goal was simply to extract the battery life periodically a simple driver of a browser seemed the easiest way.

## Polling

The cloud platform itself only updates every 5minutes so polling every 20 mins seems sensible given battery percentages
can't rapidly change too fast.

## Extract other things?

Right now all I cared about was battery life as I already have CT clamps to monitor generation & grid usage.
