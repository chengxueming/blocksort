(function(global){
	'use strict';

	function createBlock(name, value, contents){
		var item = elem('div', {'class': 'block', draggable: true, 'data-name': name}, [name]);
		if (value !== undefined && value !== null){
        console.log(typeof value);
        if(typeof value == "object") {
			      item.appendChild(elem('input', {value: value.lvalue}, []));
            var options = value.opts.map(function(opt){
                var attrs = {value:opt};
                if(value.opt == opt) {
                    attrs.selected = "selected";
                }
                return elem("option", attrs, [opt]);
            });
            console.log(options);
			      item.appendChild(elem('select', {}, options));
			      item.appendChild(elem('input', {value: value.rvalue}, []));
        }else {
			      item.appendChild(elem('input', {value: value}, []));
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


	  function blockValue(block){
        //var childs = block.querySelectorAll("not(.container)")
        var childs = block.children;
        console.log(childs);
        if(childs.length == 1) {
		        var input = childs[0];
		        return input ? input.value : null;
        }else if([3,4].indexOf(block.children.length) != -1) {
            var input1 = childs[0].value;
            var select = childs[1];
	          var value = select.options[select.selectedIndex].value;
            var opts = [].slice.call(select.options).map(function(v){return v.value;});
            var input2 = childs[2].value;
            return {lvalue:input1, opt:value, rvalue:input2, "opts":opts};
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
    function realValue(value) {
        //if not a dight
        if(String(value).match(/^\d+$/)  == null) {
            return Block.variable[value];
        }else {
            return Number(value);
        }
    }

	global.Block = {
		create: createBlock,
		value: blockValue,
		contents: blockContents,
		script: blockScript,
		run: runBlocks,
		  trigger: trigger,
      realValue: realValue,
      variable:{}
	};


	window.addEventListener('unload', file.saveLocal, false);
	window.addEventListener('load', file.restoreLocal, false);
})(window);
