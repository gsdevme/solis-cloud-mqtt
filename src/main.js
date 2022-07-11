const puppeteer = require("puppeteer");
const mqtt = require('mqtt');
const structuredLog = require('structured-log');

(async () => {
    const solisEmail = process.env.SOLIS_EMAIL || process.abort()
    const solisPassword = process.env.SOLIS_PASSWORD || process.abort()
    const solisStationId = process.env.SOLIS_STATION_ID || process.abort()
    const mqttHost = process.env.MQTT_HOST || process.abort()

    const logger = structuredLog.configure()
        .writeTo(new structuredLog.ConsoleSink({
            includeTimestamps: true
        }))
        .create();

    logger.info("Started")

    async function createBrowser() {
        return await puppeteer.launch({
            bindAddress: "0.0.0.0",
            args: [
                "--headless",
                "--no-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
                //"--remote-debugging-port=9222",
                //"--remote-debugging-address=0.0.0.0"
            ]
        });
    }

    async function login(page) {
        await page.goto("https://www.soliscloud.com/", {
            waitUntil: "networkidle0"
        });

        logger.debug('attempting login for solis cloud');

        // LOGIN
        await page.type('input[placement=bottom-start]', solisEmail);
        await page.type('input[type=password]', solisPassword);
        await page.click('.el-checkbox__inner');

        await page.click('.login-btn > button[type=button]');

        await page.waitForNetworkIdle({
            idleTime: 5000
        })
        await page.waitForSelector('.stationList')

        logger.debug('logged into solis cloud');
    }

    async function getBatteryInformation(page) {
        await page.goto('https://www.soliscloud.com/#/station/stationdetail_1?id=' + solisStationId, {
            waitUntil: "networkidle0"
        });

        logger.debug('attempting fetching the station on solis cloud');

        await page.waitForSelector('.batteryProgress');
        await page.waitForNetworkIdle({
            idleTime: 5000
        });
        await page.waitForSelector('.colorBox1', {
            visible: true
        });

        logger.debug('battery information finished rendering on solis cloud');

        let batteryPercentage = await page.$eval('.colorBox1', ele => ele.textContent);
        let batteryStatus = (await page.$$('.batteryProgressColor3')).length === 1 ? 'discharging' : 'charging';

        return {
            batteryPercentage: batteryPercentage.toString().replace("%", ""),
            status: batteryStatus
        }
    }

    const mqttClient = mqtt.connect(mqttHost)
    const mqttTopic = 'solis/' + solisStationId;

    function publish(battery) {
        mqttClient.publish(mqttTopic + "/battery_percent", battery.batteryPercentage);
        mqttClient.publish(mqttTopic + "/status", battery.status);
        mqttClient.publish(mqttTopic + "/attributes", JSON.stringify(battery));

    }

    const browser = await createBrowser()
    const page = await browser.newPage();

    await login(page)

    // TODO move to config really
    const refreshLimit = 12; // i.e. login every 12 fetches of the data
    const refreshWait = 10 * 60 * 1000; // 10mins
    let refreshAttempts = 0;

    do {
        refreshAttempts += 1;

        logger.debug('attempt #' + refreshAttempts);

        let battery = await getBatteryInformation(page)

        publish(battery);

        await page.waitForTimeout(refreshWait);

    } while (refreshAttempts < refreshLimit);

    await browser.close();

    logger.info("Finished")

    process.exit(0);
})();
