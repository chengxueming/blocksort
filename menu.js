(function(global){
	'use strict';

	var menu = document.querySelector('.menu');
	var script = document.querySelector('.script');
	var scriptRegistry = {};
	var scriptDirty = false;
    var compareFuncs = {
        "<":function(lv, rv) {return Block.realValue(lv) < Block.realValue(rv);},
        ">":function(lv, rv) {return Block.realValue(lv) > Block.realValue(rv);},
        "==":function(lv, rv) {return Block.realValue(lv) == Block.realValue(rv);},
    };

	function runSoon(){ scriptDirty = true; }

	function menuItem(name, fn, value, units){
		var item = Block.create(name, value, units);
		scriptRegistry[name] = fn;
		menu.appendChild(item);
		return item;
	}

	function run(){
		if (scriptDirty){
			scriptDirty = false;
			Block.trigger('beforeRun', script);
			var blocks = [].slice.call(document.querySelectorAll('.script > .block'));
			Block.run(blocks);
			Block.trigger('afterRun', script);
		}else{
            Block.trigger('everyFrame', script);
        }
		requestAnimationFrame(run);
	}
	requestAnimationFrame(run);

	function runEach(evt){
		var elem = evt.target;
		if (!matches(elem, '.script .block')) return;
		if (elem.dataset.name === 'Define block') return;
		elem.classList.add('running');
		scriptRegistry[elem.dataset.name](elem);
		elem.classList.remove('running');
	}

    function illegalVar(value) {
        return typeof Block.realValue(value) == "undefined";
    }

    function compare(opt, lv, rv) {
        lv = stringTrim(lv);
        rv = stringTrim(rv);
        if(illegalVar(lv) || illegalVar(rv)) {
            console.log("compare illeagal param");
            return false;
        }
        var compareFuncs = {
            "<":function(lv, rv) {return Block.realValue(lv) < Block.realValue(rv);},
            ">":function(lv, rv) {return Block.realValue(lv) > Block.realValue(rv);},
            "==":function(lv, rv) {return Block.realValue(lv) == Block.realValue(rv);},
        };
        return compareFuncs[opt](lv, rv);
    }

	function repeat(block){
		var count = Block.value(block);
		var children = Block.contents(block);
		for (var i = 0; i < count; i++){
			Block.run(children);
		}
	}
    function inCase(block) {
        var value =  Block.value(block);
		    var children = Block.contents(block);
        if(compare(value.opt, value.lvalue, value.rvalue)) {
            console.log("incase worked");
			      Block.run(children);
        }
    }

    function repeatIf(block) {
		    var value = Block.value(block);
		    var children = Block.contents(block);
        var count = 0;
        while(compare(value.opt, value.lvalue, value.rvalue) && count < 1000) {
			      Block.run(children);
            count++;
        }
        if(count >= 1000) {
            alert("max repeat occured");
        }
    }

    function set(block) {
        var value =  Block.value(block);
        console.log(value);
        var funcs = {
            "=":function(lv, rv) {
                console.log("= affect");
                Block.variable[lv] = Block.realValue(rv);
            },
            "+":function(lv, rv) {
                Block.variable[lv] += Block.realValue(rv);
            },
            "-":function(lv, rv) {
                Block.variable[lv] -= Block.realValue(rv);
            }
        };
        value.lvalue = stringTrim(value.lvalue);
        if(value.lvalue == "" || illegalVar(value.rvalue)) {
            console.log("noting happend");
            return;
        }
        funcs[value.opt](value.lvalue, value.rvalue);
    }

	  menuItem('Repeat', repeat, 10, []);
    menuItem("If", inCase, {rvalue:"", lvalue:"", opt:">", opts:[">", "==", "<"]}, []);
    menuItem("RepeatIf", repeatIf, {rvalue:"", lvalue:"", opt:">", opts:[">", "==", "<"]}, []);
    menuItem("Set", set, {rvalue:"", lvalue:"", opt:"=", opts:["=", "+", "-"]});

	global.Menu = {
		runSoon: runSoon,
		item: menuItem
	};

	document.addEventListener('drop', runSoon, false);
	script.addEventListener('run', runEach, false);
	script.addEventListener('change', runSoon, false);
	script.addEventListener('keyup', runSoon, false);
})(window);
