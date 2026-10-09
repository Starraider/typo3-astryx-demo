<?php
declare(strict_types=1);
require __DIR__ . '/../../Classes/Configuration/ThemeResolver.php';
use Skom\Typo3Astryx\Configuration\ThemeResolver;
$resolver = new ThemeResolver();
function expect(mixed $actual, mixed $expected): void { if ($actual !== $expected) { throw new RuntimeException(json_encode(['actual'=>$actual,'expected'=>$expected])); } }
expect($resolver->resolve([], [])['theme'], 'neutral');
expect($resolver->resolve([], [])['allowUserMode'], true);
expect($resolver->resolve([], ['Astryx.allowUserMode'=>false])['allowUserMode'], false);
expect($resolver->resolve([], ['Astryx.theme'=>'invalid','Astryx.mode'=>'invalid'])['mode'], 'system');
$result=$resolver->resolve([
 ['uid'=>3,'tx_astryx_theme'=>'ocean','tx_astryx_mode'=>''],
 ['uid'=>2,'tx_astryx_theme'=>'invalid','tx_astryx_mode'=>'dark'],
 ['uid'=>1,'tx_astryx_theme'=>'stone','tx_astryx_mode'=>'light'],
], ['Astryx.theme'=>'neutral','Astryx.mode'=>'system']);
expect($result['theme'],'ocean');expect($result['mode'],'dark');
expect($resolver->resolve([['tx_astryx_theme'=>'','tx_astryx_mode'=>'']],['Astryx.theme'=>'stone'])['theme'],'stone');
echo "Theme resolution passed: defaults, invalid values, site overrides and independent ancestor inheritance\n";
