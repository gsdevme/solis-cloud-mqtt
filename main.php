<?php

use Symfony\Component\Panther\Client;

require __DIR__.'/vendor/autoload.php';

$client = Client::createChromeClient();
$client->request('GET', 'https://www.soliscloud.com/');

try {
    $crawler = $client->waitFor('form');

    $usernameInput = $crawler->filter('input[placement=bottom-start]');
    $usernameInput->sendKeys(strval(getenv('SOLIS_EMAIL')));

    $passwordInput = $crawler->filter('input[type=password]');
    $passwordInput->sendKeys(strval(getenv('SOLIS_PASSWORD')));

    $terms = $crawler->filter('.el-checkbox__inner')->click();

    $button = $crawler->selectButton('Log in');
    $button->click();

    $client->waitForVisibility('td');

    $crawler->filter('td')->first()->click();

    $client->switchTo()->window($client->getWindowHandles()[1]);

    $crawler = $client->waitForVisibility('.batteryProgress');

    $client->waitForElementToNotContain('.colorBox1', '0%');

    dump($crawler->filter('.colorBox1')->first()->getText());


    $client->takeScreenshot('screen.png'); // Yeah, screenshot!
} catch (\Throwable $e) {

    $client->close();

    throw $e;
}

$client->close();
