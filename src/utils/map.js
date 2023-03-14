export default function gdMap() {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap);
    } else {
      const key = 'a4011c29180d411529f617473b024429'; // 修改为自己申请的 key, 直接在高德开发平台申请即可
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = 'async';
      script.src = 'https://webapi.amap.com/maps?v=1.4.15&callback=initAMap&plugin=AMap.Autocomplete,AMap.Driving,AMap.PlaceSearch,AMap.CircleEditor,AMap.GraspRoad&key=' + key;
      script.onerror = reject;
      document.head.appendChild(script);
    }
    if (!window.AMapUI) {
      setTimeout(() => {
        // 确保AMap 已经加载完成再执行
        var script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.defer = 'defer';
        script2.src = 'https://webapi.amap.com/ui/1.0/main.js?v=1.0.11';
        document.head.appendChild(script2);
      }, 3000);
    }
    window.initAMap = () => {
      resolve(window.AMap);
    };
  });
}
