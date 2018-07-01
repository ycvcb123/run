var meters = 0;
var countTooGetLocation = 0;
var total_micro_second = 0;
var starRun = 1;
var totalSecond = 0;

Page({
    data: {
        clock: '',
        latitude: 0,
        longitude: 0,
        markers: [],
        meters: 0,
        time: "0:00:00",
        run: true
    },
    //页面初始化
    onLoad: function (options) {
        this.getLocation();
        this.keepPaint();
    },
    //每隔几秒就重新计算位置，生成marker数组，绘制运动轨迹
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
    },
    // 时间格式化输出，如03:25:19 86。每10ms都会调用一次
    date_format: function(micro_second) {
        // 秒数
        var second = Math.floor(micro_second / 1000);
        // 小时位
        var hr = Math.floor(second / 3600);
        // 分钟位
        var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
        // 秒位
        var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;


        return hr + ":" + min + ":" + sec + " ";

        function fill_zero_prefix(num) {
            return num < 10 ? "0" + num : num
        }
    },
    //获取当前坐标，并计算两个坐标点距离
    getLocation: function () {
        var that = this
        wx.getLocation({
            type: 'gcj02', //map 组件使用的经纬度是火星坐标系，调用 wx.getLocation 接口需要指定 type 为 gcj02
            success: function (res) {
                console.log("调用getLocation成功, res：", res);
                var newMarker = {
                    latitude: res.latitude,
                    longitude: res.longitude,
                    iconPath: '/images/redpoint.png',
                    width: '20rpx',
                    height: '20rpx'
                };
                var markersArr = that.data.markers;
                var len = markersArr.length;
                var lastMarker;
                if (len == 0) {
                    markersArr.push(newMarker);
                }
                len = markersArr.length;
                lastMarker = markersArr[len - 1];

                var newMeters = that.getDistance(lastMarker.latitude, lastMarker.longitude, res.latitude, res.longitude) / 1000;

                if (newMeters < 0.0015) {
                    newMeters = 0.0;
                }
                meters = new Number(meters + newMeters).toFixed(2);

                markersArr.push(newMarker);

                that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    markers: markersArr,
                    meters: meters
                });
            },
        })
    },
    //固定公式就不深究是怎么算的了，找两个地点的经纬度验证下准确性即可
    getDistance: function (lat1, lon1, lat2, lon2) {
        var dis = 0;
        var radLat1 = toRadians(lat1);
        var radLat2 = toRadians(lat2);
        var deltaLat = radLat1 - radLat2;
        var deltaLng = toRadians(lon1) - toRadians(lon2);
        var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
        //6378137 地球半径
        return dis * 6378137;

        function toRadians(d) { return d * Math.PI / 180; }
    },
    //打开地图获取当前定位
    openLocation: function () {
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                wx.openLocation({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    scale: 28, // 缩放比例
                })
            },
        })
    },
    //更新时间
    updateTime: function (time) {
        this.setData({
            time: time,
        })

    },
    //暂停跑步
    runstatus: function () {
        var that = this;
        var run = !that.data.run;
        that.setData({
            run: run
        });
        if(run){
            if (starRun == 1) {
                return;
            }
            starRun = 1;
            that.keepPaint(that);
            that.getLocation();
        }else{
            starRun = 0;
            that.keepPaint(that);
        }
    }
})