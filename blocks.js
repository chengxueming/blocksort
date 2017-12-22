(function(global){
	'use strict';
  global.arr = [];

    function createExpr(value) {
        if(typeof value == "object") {
            return createBlock("Expr", value);
        }
        return elem('input', {class:"expr", value: value}, []);
    }

	function createBlock(name, value, contents){
		var item = elem('div', {'class': 'block', draggable: true, 'data-name': name}, [name]);
		if (value !== undefined && value !== null){
        console.log(typeof value);
        if(typeof value == "object") {
            //对于一个函数有很多输入参数的情况 比如exchange
            if(value instanceof Array) {
                value.map(function(v) {
                    item.appendChild(createExpr(v));
                });
            }else {
                //set expr 等的表达式
                item.appendChild(createExpr(value.lvalue));
                var options = value.opts.map(function(opt){
                    var attrs = {value:opt};
                    if(value.opt == opt) {
                        attrs.selected = "selected";
                    }
                    return elem("option", attrs, [opt]);
                });
                console.log(options);
                item.appendChild(elem('select', {}, options));
                item.appendChild(createExpr(value.rvalue));
            }
        }else {
            //最原始的比如repeate
            item.appendChild(elem('input', {class:"expr", value: value}, []));
        }
		}
		if (Array.isArray(contents)){
			item.appendChild(elem('div', {'class': 'container'}, contents.map(function(block){
				return createBlock.apply(null, block);
			})));
		}else if (typeof contents === 'string'){ // Add units specifier
			item.appendChild(document.createTextNode(' ' + contents));
		}
		return item;
	}

	function blockContents(block){
		var container = block.querySelector('.container');
		return container ? [].slice.call(container.children) : null;
	}

    function inputValue(input) {
        //返回一个表达式 在realvalue中支持
        if(input.tagName == "INPUT") {
            return input.value;
        }
        return blockValue(input);
    }

	  function blockValue(block){
        //var childs = block.querySelectorAll("not(.container)")
        var childs = [].slice.call(block.children).filter(function(v){return !matches(v, ".container")});
        //单值情况
        if(childs.length == 1) {
		        return inputValue(childs[0]);
            //if repeate if set
        }else if(childs.length > 1 && childs[1].tagName == "SELECT") {
            var input1 = inputValue(childs[0]);
            var select = childs[1];
	          var value = select.options[select.selectedIndex].value;
            var opts = [].slice.call(select.options).map(function(v){return v.value;});
            var input2 = inputValue(childs[2]);
            return {lvalue:input1, opt:value, rvalue:input2, "opts":opts};
        //exchange
        }else {
            var values = [];
            childs.forEach(function(ele, index) {
                values.push(inputValue(ele));
            });
            return values;
        }
	  }
	function blockUnits(block){
		if (block.children.length > 1 && block.lastChild.nodeType === Node.TEXT_NODE && block.lastChild.textContent){
			return block.lastChild.textContent.slice(1);
		}
	}

	function blockScript(block){
		var script = [block.dataset.name];
        var value = blockValue(block);
        if (value !== null){
    		script.push(blockValue(block));
        }
		var contents = blockContents(block);
		var units = blockUnits(block);
		if (contents){script.push(contents.map(blockScript));}
		if (units){script.push(units);}
		return script.filter(function(notNull){ return notNull !== null; });
	}

	function runBlocks(blocks){
		blocks.forEach(function(block){ trigger('run', block); });
	}
    function trim(value) {
        if(value instanceof Object) {
            return value;
        }
        return stringTrim(value);
    }
    function exprValue(value) {
        console.log("expr is", value)
        var lv = trim(value.lvalue);
        var rv = trim(value.rvalue);
        if(Block.illegalVar(lv) || Block.illegalVar(rv)) {
            console.log("compare illeagal param");
            return false;
        }
        var exprFuncs = {
            "<":function(lv, rv) {return realValue(lv) < realValue(rv);},
            ">":function(lv, rv) {return realValue(lv) > realValue(rv);},
            "==":function(lv, rv) {return realValue(lv) == realValue(rv);},
            ">=":function(lv, rv) {return realValue(lv) >= realValue(rv);},
            "<=":function(lv, rv) {return realValue(lv) <= realValue(rv);},
            "and":function(lv, rv) {return realValue(lv) && realValue(rv);},
            "or":function(lv, rv) {return realValue(lv) || realValue(rv);},
            "+":function(lv, rv) {return realValue(lv) + realValue(rv);},
            "-":function(lv, rv) {return realValue(lv) - realValue(rv);},
        };
        return exprFuncs[value.opt](lv, rv);
    }
    function realValue(value) {
        //value can be a str expr or a map
        //if not a dight
        if(value instanceof Object) {
            return exprValue(value);
        } else {
            if(String(value).match(/^[+|-]*\d+$/)  == null) {
                //index of a arr
                if(String(value).startsWith("arr") == true) {
                    var index = realValue(String(value).match(/arr\[(.*)\]/)[1]);
                    console.log("cache arr used, index is ", index, "arr is ", global.arr);
                    return global.arr[index];
                }else {
                    return Block.variable[value];
                }
            }else  {
                return Number(value);
            }
        }
    }

    function illegalVar(value) {
        return typeof realValue(value) == "undefined";
    }

	global.Block = {
		create: createBlock,
		value: blockValue,
		contents: blockContents,
		script: blockScript,
		run: runBlocks,
		  trigger: trigger,
      realValue: realValue,
      illegalVar: illegalVar,
      variable:{}
	};

    global.arr = [];
	window.addEventListener('unload', file.saveLocal, false);
	window.addEventListener('load', file.restoreLocal, false);
})(window);
