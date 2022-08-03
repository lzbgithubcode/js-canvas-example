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
    const hiddenCanvas = createCanvas();
    const hiddenCtx = hiddenCanvas.getContext("2d"); 
    const topCanvas = createCanvas();
    const topCtx = topCanvas.getContext("2d"); 

    mapCtx.width =  mapCanvas.width = hiddenCanvas.width = hiddenCtx.width =  topCanvas.width = topCtx.width = width;
    mapCtx.height =  mapCanvas.height = hiddenCanvas.height = hiddenCtx.height =  topCanvas.height = topCtx.height = height;
    mapDom.appendChild(mapCanvas);
    mapDom.appendChild(hiddenCanvas);


    // 4. 初始化地图
    const mapHashColor = {};
    // 记录上一次是否被选择
    let preMoveSelected = false;
    // 记录上一次选择的图形
    let lastSelectColorKey;
    initMapData();

    // 5. 事件监听
    mapCanvas.addEventListener("mousemove", moveChange);


    /**
     * 监听move
     */
    function moveChange(e){
       
       // 获取触摸的color
       const keyColor = getHexColor(e);
       // 获取地图信息
       const geoInfo = mapHashColor[keyColor];
       
       if(!geoInfo){
       }
       preMoveSelected = true;
       
       // 绘制地图
       drawSelectRegionMap(geoInfo);
    }



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
                      drawGraph(mapCtx, hiddenCtx, coordinateItem, 1, randomColor, "#07467f", "#FFC0CB", true);
                });

                // 绘制每个图形的名称
                if(center && center.length > 1){
                  const point = geoToPoint(center);
                  drawGraphText(mapCtx,point, "#FF00FF", name);
                }
                
         });

     }

     /**
      *  绘制区域地图
      */
     function drawSelectRegionMap(geoInfo){
         clear(topCtx);
         Object.keys(mapHashColor).forEach(colorKey => {
                if(lastSelectColorKey == colorKey){
                  return;
                }
                if(geoInfo && geoInfo.randomColor == colorKey){
                   mapHashColor[colorKey].coordinates.forEach(coordinateGroup =>{
                     console.log("======coordinateGroup======",coordinateGroup);
                   })
                }
         })

     }


     /**
      *  绘制图形
      */
     function drawGraph(ctx,hiddenCtx, points, lineWidth, tagColor, color, strokeColor ,isFill = false){
          // 绘制内容画布
          drawOneGraph(ctx, points, lineWidth, color, strokeColor, isFill); 
          // 绘制隐藏画布
          drawOneGraph(hiddenCtx, points, lineWidth, tagColor, null, true);
     }

     /**
      * 绘制当个图形
      * @param { } ctx 
      * @param {*} points 
      * @param {*} lineWidth 
      * @param {*} color 
      * @param {*} strokeColor 
      */
    function drawOneGraph(ctx, points, lineWidth, color, strokeColor, isFill){

      // 保存当前状态
      ctx.save();

      ctx.beginPath();

      // 设置ctx基本属性
      color && (isFill ? ctx.fillStyle = color : ctx.strokeStyle = color); // 设置填充颜色
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.round = "round";
      strokeColor && (ctx.strokeStyle = strokeColor); // 设置描边颜色

      // 绘制每一个图形
      points.forEach((point, index) => {
         if(!index){
             ctx.moveTo(point.x, point.y);
         }else{
            ctx.lineTo(point.x, point.y);
         }
      });

      ctx.closePath();

      // 填充
      isFill ? ctx.fill() : ctx.stroke();
      // 描边
      strokeColor &&  ctx.stroke();

    }

    /**
     * 绘制图形的文字
     * @param {*} ctx 
     * @param {*} point 文字的位置 
     * @param {*} color 
     * @param {*} text 
     */ 
    function drawGraphText(ctx, point, color, text){

       ctx.save();
       ctx.beginPath();
       const textWidth =ctx.measureText(text).width;
       ctx.moveTo(point.x - textWidth *0.5, point.y); //移动笔触开始
       ctx.fillStyle = color;
       ctx.font = "14";
       ctx.textBaseline = "middle";
       ctx.fillText(text, point.x - textWidth*0.5, point.y);
       ctx.closePath();
    }


    /**
     * 清除
     */
    function clear(context){
       if(context){
          context.clearRect(0,0,context.width ,context.height);
          return;
       }
       mapCtx.clearRect(0, 0, mapCtx.width, mapCtx.height);
       hiddenCtx.clearRect(0, 0, hiddenCtx.width, hiddenCtx.height);
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
            y : (bounds.yMax - latitude) * rate + yOffset
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
       * 获取颜色
       */
      function getHexColor(event){
          const x  = event.offsetX;
          const y = event.offsetY;
          // 获取拾取到的颜色数据rgb
          const data = hiddenCtx.getImageData(x, y, 1,1);

            /**
           *   颜色值转换
           * */
          const toHex = (r,g, b) =>{
              
            function ColorToHex(color){
                const hex = color.toString(16);
                return hex.length === 1 ? "0" + hex: hex;
            }

            return `#${ColorToHex(r)}${ColorToHex(g)}${ColorToHex(b)}`
          };
           // 获取拾取到的颜色数据hex
         const color = toHex(data.data[0],data.data[1],data.data[2]); 
         return color; 
      }

  

     /**
      * 创建canvas
      */
     function createCanvas(){
       return typeof document !== 'undefined' && document.createElement('canvas');
     }
});