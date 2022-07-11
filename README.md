# Solis Cloud MQTT

This drives a chrome browser to login into the cloud platform and extract the battery percentage.

This has been written for a Solis Hybrid inverter using the data logger to push to the cloud platform.

![Screenshot 2022-07-11 at 08 15 37](https://user-images.githubusercontent.com/319498/178209191-1a9e699b-0c92-45d8-bf3e-71a9f5a6feac.png)


## Environmental Variables

```bash
SOLIS_STATION_ID=
SOLIS_EMAIL=
SOLIS_PASSWORD=
MQTT_HOST=
```

### Manual HA

Ideally Id create self discovery but for now

```yaml
mqtt:
  sensor:
    - unique_id: "solis_inverter_battery"
      name: "Home Battery"
      state_topic: "solis/<id>/battery_percent"
      unit_of_measurement: "%"
      value_template: "{{ value_json }}"
      device_class: "battery"
```

### Running

The best way to run this is to deploy the container image either via Docker or Kubernetes

```bash
 docker run -it --env-file=.env solis-cloud:latest
 ```

## Why?

The API has quite alot of security by obscurity so trying to directly use the API could be very brittle to change. 
Given my goal was simply to extract the battery life periodically a simple driver of a browser seemed the easiest way.

## Polling

The cloud platform itself only updates every 5minutes so polling every 10 mins seems sensible given battery percentages
can't rapidly change too fast.

## Extract other things?

Right now all I cared about was battery life as I already have CT clamps to monitor generation & grid usage.
