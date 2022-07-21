 /**
   *   拾取图形的方案
   *  方案一: 缓存canvas 通过颜色拾取图形
   *  方案二： 内置API拾取图形
   *  方案三： 几何计算拾取图形
   * 
   * 
   * 
   * 
   * 
   * */
// 图形绘制canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 顶层绘制canvas
const topCanvas = document.getElementById('topCanvas');
const topCtx = topCanvas.getContext('2d');
  
  

// 1. 创建隐藏canvas - 渲染颜色值
const hiddenCanvas = document.createElement("canvas")
const hiddenCtx = hiddenCanvas.getContext('2d');
const cacheColor = {};

const width = ctx.canvas.width;
const height = ctx.canvas.height;

hiddenCanvas.width = canvas.width;
hiddenCanvas.height = canvas.height;
topCanvas.width = canvas.width;
topCanvas.height = canvas.height;



const dataList = [10,20,30,10,100,80];

// 需要分的数量
const num = dataList.length;
const centerX = width * 0.5;
const centerY = height * 0.5;
// 半径
const radius = 100;
// 外半径
const outRadius = 50;
const anticlockwise = false; //  false 顺时针   true 逆时针

let startAngle = 0;
let endAngle = 0;

//总计 所有数据的
let totalValue = 0;
dataList.map(number => {
      totalValue = totalValue + number;
});


canvas.onclick = function(event){
  const x  = event.offsetX;
  const y = event.offsetY;
  // 获取拾取到的颜色数据rgb
  const data = hiddenCtx.getImageData(x, y, 1,1);
  
  // 获取拾取到的颜色数据hex
  const color = toHex(data.data[0],data.data[1],data.data[2]);

  // 获取到颜色对应的图形数据
  const graphData = cacheColor[color];

  console.log("拾取到color颜色========",color,graphData);
  if(graphData){
    // 绘制选择图形
    drawSelectGraph(
      graphData.centerX, 
      graphData.centerY, 
      graphData.radius + 10, 
      graphData.startAngle,
      graphData.endAngle, 
      graphData.anticlockwise, 
      color)
      topCanvas.style.display = "block";
      topCanvas.style.opacity = "0.5";
  }
  
}
 


/*获取随机颜色*/
const  getRandomColor =  () => {
  return  '#' + (function(color){    
      return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])    
      && (color.length == 6) ?  color : arguments.callee(color);    
  })('');   
}
/**
 * 顶层图形绘制
 */
const drawSelectGraph = (centerX, centerY, radius, startAngle, endAngle, anticlockwise, color) =>{
   // 清楚内容
    topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
    //重新绘制
    topCtx.beginPath();
    topCtx.moveTo(centerX, centerY);
    topCtx.arc( centerX, centerY, radius, startAngle, endAngle, anticlockwise);
    topCtx.fillStyle = color;
    topCtx.fill();

};

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

/**
 * 
 * */

/**
 * 绘制饼图
 * */
const drawPie = ()=>{
    /*上一次绘制的结束弧度等于当前次的起始弧度*/
    for(let i = 0; i < num; i++){
      const value = dataList[i];
      // 每次的弧度 = 360 * 当前值 / 总值的占比
      const angle = (Math.PI * 2) * (value / totalValue);

      // 结束弧度 =  上一次的开始 + 当前要绘制的弧度
      endAngle = startAngle + angle;

      const color =  getRandomColor();
      // 绘制圆弧
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc( centerX, centerY, radius, startAngle, endAngle, anticlockwise);
      ctx.fillStyle = color;

      ctx.fill();

        // 绘制隐藏的圆弧
        hiddenCtx.beginPath();
        hiddenCtx.moveTo(centerX, centerY);
        hiddenCtx.arc( centerX, centerY, radius, startAngle, endAngle, anticlockwise);
        hiddenCtx.fillStyle = color;
        hiddenCtx.fill();

        cacheColor[color] = {
        centerX,
        centerY,
        radius,
        startAngle,
        endAngle,
        anticlockwise
        }

      drawTitle(startAngle, angle,  ctx.fillStyle, "测试");

      // 当前开始弧度 = 上一次结束的弧度
      startAngle = endAngle;
    }
};


/**
 *  绘制标题
 * */
const drawTitle = (startAngle, angle, color, title)=>{
  
    // 1. 延伸点 计算斜边 = 内径 + 外径
    const edge = radius + outRadius;
    
    // 2. 延伸点 直接边 x 、y
    const edgeX = Math.cos(startAngle + angle/2) * edge;
    const edgeY = Math.sin(startAngle + angle/2) * edge;

    // 3.计算延伸点的左边
    const outX = centerX + edgeX;
    const outY = centerY + edgeY;

    // 4. 绘制线
    ctx.beginPath();
    ctx.moveTo(centerX, centerY); //从中心点开始
    ctx.lineTo(outX, outY); // 移动到另一个点
    ctx.strokeStyle = color;
  

    // 5. 绘制文字
    /**  
    *   在中心点的左边，文字项 左边配置
    *   在中心点的右边，文字项 右边配置
    * 
    * */
    ctx.font = "14";
    const textWidth = ctx.measureText(title).width;
    ctx.textBaseline = "bottom"; // 从底部开始绘制
    if(outX > centerX){
      // 右边
      ctx.lineTo(outX + textWidth, outY); // 移动到另一个点
      ctx.textAlign = "left";
      ctx.stroke();
      ctx.fillText(title, outX+5, outY-5);
    }else{
      // 左边
      ctx.lineTo(outX - textWidth, outY); // 移动到另一个点
      ctx.textAlign = "right";
      ctx.stroke();
      ctx.fillText(title, outX-5, outY-5);
    }
  
}    
drawPie();