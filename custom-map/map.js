(function(global, factory){
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.echarts = {}));
})(this, function(exports){
   

    // 1. 获取dom节点信息
    const mapDom = document.getElementById("map");
    const width = mapDom.clientWidth;
    const height = mapDom.clientHeight;


    // 2. 创建canvas 
    const mapCanvas = createCanvas();
    const mapCtx = mapCanvas.getContext("2d"); 
    mapCtx.width =  mapCanvas.width = width;
    mapCtx.height =  mapCanvas.height = width;
    mapDom.appendChild(mapCanvas);

    // 4. 初始化地图
    const mapHashColor = {};
    initMapData();


      /**
       * 初始化地图数据
       */
     async function initMapData(){
         const fetchHandler = await fetch("./full-china.json");
         const GeoJSON = await fetchHandler.json();
         GeoJSON.features.forEach(item => {
                // 缓存每个地区的数据
                const {name, center} = item.properties;
                // 边缘描点
                const coordinates = item.geometry.coordinates;
                
                // 缓存地区对应的颜色
                const randomColor = getRandomColor();
                mapHashColor[randomColor] ? randomColor = getRandomColor() : "";
                mapHashColor[randomColor] = {
                   name,
                   center,
                   coordinates,
                   randomColor
                }

                // 遍历图形边缘点
                coordinates.forEach(coordinateGroup => {
                      const coordinateItem = coordinateGroup[0];
                      coordinateItem.forEach((geoPointItem, index) => {
                          coordinateItem[index] = geoToPoint(geoPointItem);
                      })
                      // 绘制每一个图形
                      console.log("🍺======",coordinateItem);
                })
         });

     }


     /**
      *  绘制图形
      */
     function drawGraph(points, randomColor){

     }


     /**
      * 经纬度坐标 -> 转化到 地图显示的坐标
      */
     function geoToPoint(pos){
       
        const longitude = pos[0]; // 计算之前的经度
        const latitude = pos[1]; // 计算之前的纬度

        // 最大最小经纬的的常量
        const bounds = {
            xMin:73.66,
            xMax: 135.05,
            yMin: 3.86,
            yMax: 53.55
        }

        // 计算比例值
        const xRate = width / Math.abs(bounds.xMax - bounds.xMin);
        const yRate = height / Math.abs(bounds.yMax - bounds.yMin);
        const rate = xRate < yRate ? xRate : yRate; // 取值较小的比例值， 不超过

    

        // canvas上计算偏移量
        const xOffset = width * 0.5 - Math.abs(bounds.xMax - bounds.xMin) * 0.5 * rate;
        const yOffset = height * 0.5 - Math.abs(bounds.yMax - bounds.yMin) * 0.5 * rate;

        
        // 在canvas上的结果点
        const point = {
            x : (longitude - bounds.xMin) * rate + xOffset,
            y : (latitude - bounds.yMin) * rate + yOffset
        }
        return point;
     }


     /**
      * 获取随机颜色
      */
      function getRandomColor(){
        return  '#' + (function(color){    
            return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])    
            && (color.length == 6) ?  color : arguments.callee(color);    
        })('');   
      }

  

     /**
      * 创建canvas
      */
     function createCanvas(){
       return typeof document !== 'undefined' && document.createElement('canvas');
     }
});