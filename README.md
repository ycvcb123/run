# run
记录跑步轨迹，事件距离的小程序

#### 使用方法

1. 本地下载微信小程序开发者工具。
2. 倒入项目后点击预览，出现二维码，手机扫二维码，然后带着手机去跑步吧骚年！！！


#### 用到小程序的api

[wx.getLocation](https://developers.weixin.qq.com/miniprogram/dev/api/location.html)

#### map中的markers为一个数组，根据这个对象数组各个元素的坐标会在地图上绘制运动轨迹，iconpath就是当前位置的表示图标。

> 注意：


covers被markers取代后一定要加上 `width, height` 这两个属性！！！不然看不到图标。

```js
 markers: [{
    iconPath: "/resources/others.png",
    id: 0,
    latitude: 23.099994,
    longitude: 113.324520,
    width: 50,
    height: 50
  }]
```

#### 根据两点经纬度计算距离的代码如下，直接复制就好，不用理解，我也是网上找的。

```js
function toRadians(d) { return d * Math.PI / 180; }
var dis = 0;
var radLat1 = toRadians(lat1);
var radLat2 = toRadians(lat2);
var deltaLat = radLat1 - radLat2;
var deltaLng = toRadians(lon1) - toRadians(lon2);
var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
//6378137 地球半径
return dis * 6378137;
```

#### 如何不停的记录轨迹，时间和距离？

如下进行递归调用：

```js
keepPaint: function () {
    var that = this;
    if (starRun == 0) {
        return;
    }

    if (countTooGetLocation >= 100) {
        var time = that.date_format(total_micro_second);
        that.updateTime(time);
    }

    if (countTooGetLocation >= 5000) { //1000为1s
        that.getLocation();
        countTooGetLocation = 0;
    }

    setTimeout(function () {
        countTooGetLocation += 10;
        total_micro_second += 10;
        that.keepPaint(that);
    }, 10)
}
```
