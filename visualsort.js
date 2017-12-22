(function(){
    'use strict';
	  var PIXEL_RATIO = window.devicePixelRatio || 1;
    var canvasPlaceholder = document.querySelector('.canvas-placeholder');
    var canvas = document.querySelector('.canvas');
    var script = document.querySelector('.script');
    var ctx = canvas.getContext('2d');
    var WIDTH, HEIGHT, radius, length, center_x, center_y;
    var _arr, startPos ;
    const width = 20; //the width of each rect
    const cell_height = 20;//one part of rect means that height
    const gap = 5;//the gap of each rect
    var points;
    var points_clone;
    var curve_all = [];
	  function onResize(evt){
		    WIDTH = canvasPlaceholder.getBoundingClientRect().width * PIXEL_RATIO;
		    HEIGHT = canvasPlaceholder.getBoundingClientRect().height * PIXEL_RATIO;
		    canvas.setAttribute('width', WIDTH);
		    canvas.setAttribute('height', HEIGHT);
		    canvas.style.top = canvasPlaceholder.getBoundingClientRect().top + "px";
		    canvas.style.left = canvasPlaceholder.getBoundingClientRect().left + "px";
		    canvas.style.width = (WIDTH / PIXEL_RATIO) + "px"
		    canvas.style.height = (HEIGHT / PIXEL_RATIO) + "px"
		    if (evt){ 
			      //Menu.runSoon(); 
		    }
	  }
    function get_points() {
        var points = [];
        for(var i=0; i< arr.length; i++) {
            points.push(new OneRect(new Point2D(startPos.x + i * (width + gap), startPos.y), arr[i]));
        }
        return points;
    }
    function reset() {
        arr = [3, 2, 1, 4, 5, 11, 13, 9, 8, 7, 6, 12];
        startPos = new Point2D(200, 400);
        points = get_points(); //the points in sort algo to use 
        points_clone = get_points(); //the points for draw to use
        curve_all = [];
        _arr = []; //the _arr is use for record exchange in points
        for(var index = 0; index < arr.length;index++) {
            _arr[index] = index;
        }
    }
    function clear() {
        reset(); 
        initRect()
    }
    function getX(radius) {
        return center_x + length * Math.sin(radius);
    }
    function getY(radius) {
        return center_y - Math.cos(radius) * length
    }
    function Point2D(x,y){  
        this.x=x||0.0;  
        this.y=y||0.0;  
    }  
    function PointOnCubicBezier( cp, t ) {  
        var   ax, bx, cx;  
        var   ay, by, cy;  
        var   tSquared, tCubed;  
        var   result = new Point2D ;  
        cx = 3.0 * (cp[1].x - cp[0].x);  
        bx = 3.0 * (cp[2].x - cp[1].x) - cx;  
        ax = cp[3].x - cp[0].x - cx - bx;  
        
        cy = 3.0 * (cp[1].y - cp[0].y);  
        by = 3.0 * (cp[2].y - cp[1].y) - cy;  
        ay = cp[3].y - cp[0].y - cy - by;  
        tSquared = t * t;  
        tCubed = tSquared * t;  
        
        result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;  
        result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;  
        
        return result;  
    }  
    //let loop = setInterval(drawClock, 1)
    function drawRect(leftDownPos, width, height) {
        ctx.strokeRect(leftDownPos.x, leftDownPos.y - height, width, height)
    }
    function ComputeBezier( cp, numberOfPoints, curve )  
    {  
        var   dt;  
        var   i;  
        
        dt = 1.0 / ( numberOfPoints - 1 );  
        
        for( i = 0; i < numberOfPoints; i++)  
            curve[i] = PointOnCubicBezier( cp, i*dt );  
    }  
    function OneRect(pos, value) {
        this.pos = pos;
        this.value = value;
    }
    function exchange(i ,j) {
        console.log("exchange ", i, " and ", j);
        var m = arr[i];
        arr[i] = arr[j];
        arr[j] = m;
        console.log(_arr);
        function changePos(i, j) {
            console.log(i, j);
            console.log(points);
            var posi = points[i].pos;
            var posj = points[j].pos;
            var cp = [posi, new Point2D((posj.x + posi.x)/2, (points[i].value + points[j].value)/2 * cell_height), posj, posj];
            console.log(posi, posj);
            var curve = [];
            ComputeBezier(cp, 50, curve);
            for(var index = 0;index < curve.length;index++) {
                curve[index] = new OneRect(curve[index], i);
            }
            return curve;
        }
        var _i = _arr[i];
        var _j = _arr[j];
        var curvei = changePos(_i, _j);
        var curvej = changePos(_j, _i);
        var pos = points[_i].pos;
        points[_i].pos = points[_j].pos;
        points[_j].pos = pos;
        var curve = [];
        var k = 0;
        for(var index = 0; index < curvei.length;index++) {
            curve[k] = curvei[index];
            curve[++k] = curvej[index];
            k++;
        }
        _arr[i] = _j;
        _arr[j] = _i;
        curve_all = curve_all.concat(curve);
    }
    function initRect() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for(var i = 0;i < points.length;i++) {
            drawRect(points[i].pos, width, cell_height * points[i].value);
        }
    }
    function main3() {
        //[["Repeat",3,[["Left",120,'degrees'],["Forward",75,'steps']]]]
        for(var i = 0;i < arr.length;i++) {
            var j = i;
            while(j - 1 >= 0) {
                if(arr[j] > arr[j - 1]) {
                    exchange(j, j - 1);
                }
                j = j - 1;
            }
        }
        drawRects();
    }
    function drawRects() {
        var rects = curve_all;
        var index = 0;
        var timer = setInterval(function() {
            if(index < rects.length) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                points_clone[rects[index].value].pos = rects[index].pos;
                for(var i = 0;i < points_clone.length;i++) {
                    drawRect(points_clone[i].pos, width, cell_height * points_clone[i].value);
                }
                index++;
            }else {
                clearInterval(timer);
            }
        }, 5);
    }

	  onResize();
	  clear();
    function _exchange(block) {
        var value =  Block.value(block);
        for(var i = 0;i < value.length; i++) {
            var ele = value[i];
            if(Block.illegalVar(ele)) {
                return false;
            }
        }
        exchange(Block.realValue(value[0]), Block.realValue(value[1]));
    }
	  Menu.item('Exchange', _exchange, ["", ""]);
	  script.addEventListener('beforeRun', clear, false); // always clear canvas first
	  script.addEventListener('afterRun', drawRects, false); // show turtle if visible
	  window.addEventListener('resize', onResize, false);
})(window);
