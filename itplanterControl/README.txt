//
//   2018/08/29  ITPLANTS,LTD>
//
//  日長周期を作り出す。
//     毎日、アイティプランターの設定を 自動で変更する。
//
//

itplanterControl.js

設定ファイル  /home/coder/coder-dist/coder-base/config/saveITPController.txt

ファイルの設定例
---Lamp--- 7:0 18:1,---Duty--- 0:0 72,---Pump--- 5:35,pumpWrokTime 42EOL---Lamp--- 7:0 16:0,---Duty--- 0:0 77,---Pump--- 5:24,pumpWrokTime 47EOL---Lamp--- 7:0 18:57,---Duty--- 0:0 90,---Pump--- 5:0,pumpWrokTime 60EOL


設定ファイルは、~/src/ITBOX/longPeriodControl.js で作成される。
~/src/ITBOX/longPeriodControl.jsの設定は、coderのlongPeriodControlで行う。

アイティプランターに関する設定を1日、１度、行う。

アイティプランターの設定項目

ライト点灯時刻、消灯時刻
ライトの照度(PWM)
ポンプ動作時刻
ポンプ動作時間

アイティプランターの項目設定は、
/home/coder/coder-dist/coder-base/sudo_scripts/ITPsetting 
で一括的に行う。

