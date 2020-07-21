/**
 * skylark-widgets-graphics - The skylark graphic widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-graphics/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-widgets-graphics/graphics',[
	"skylark-langx/skylark"
],function(skylark) {
	var graphics = {};

	return skylark.attach("widgets.graphics",graphics);

});


define('skylark-widgets-graphics/Graph',[
	"skylark-domx-eventer",
	"skylark-widgets-base/Widget",
	"./graphics"
],function(eventer, Widget,graphics){
	"use strict";

	/**
	 * Graph element is used to draw interactive line graphs.
	 *
	 * It is meant to be used as input in forms to controls values in arrays.
	 *
	 * Multiple graph lines can be displayed, each graph line has a name that can be used to access its properties.
	 * 
	 * @class Graph
	 * @extends {Widget}
	 * @param {Widget} parent Parent element.
	 * @param {String} name Name of the default graph.
	 * @param {String} color CSS hex color code of the default graph.
	 */
	var NumberBox = Widget.inherit({

		_construct : function (parent, name, color) {
			Widget.prototype._construct.call(this, parent, "div");

			var self = this;

			this._elm.style.overflow = "visible";

			/**
			 * Scale margin in pixels.
			 *
			 * @property scaleMargin
			 * @type {Number}
			 */
			this.scaleMargin = 22;

			/**
			 * Value button size.
			 *
			 * @property buttonRadius
			 * @type {Number}
			 */
			this.buttonRadius = 10;

			/**
			 * Maximum value displayed vertically.
			 *
			 * @property max
			 * @type {Number}
			 */
			this.max = 1.0;

			/**
			 * Minimum value displayed vertically.
			 *
			 * @property min
			 * @type {Number}
			 */
			this.min = 0.0;

			/**
			 * Grid canvas element.
			 *
			 * @property grid
			 * @type {DOM}
			 */
			this.grid = document.createElement("canvas");
			this.grid.style.position = "absolute";
			this.grid.style.marginLeft = this.scaleMargin + "px";
			this._elm.appendChild(this.grid);

			/**
			 * The graph lines stored in this graph.
			 *
			 * @property graph
			 * @type {Array}
			 */
			this.graph = [];
			this.addGraph(name, color);
			
			/**
			 * Scale DOM elements.
			 *
			 * @property scale
			 * @type {Array}
			 */
			this.scale = [];
			this.createScale(3);
		},


		/**
		 * Create numeric scale for this graph.
		 *
		 * @method createScale
		 * @param {Number} size Number of values in the scale.
		 */
		createScale : function(size) {
			for(var i = 0; i < this.scale; i++)
			{
				this._elm.removeChild(this.scale[i]);
			}
			
			var step = (this.max - this.min) / (size - 1);

			for(var i = 0; i < size; i++)
			{
				var scale = document.createElement("div");
				scale.style.position = "absolute";
				scale.style.pointerEvents = "none";
				scale.style.color = Editor.theme.textColor;

				var text = document.createTextNode(this.max - (step * i));
				scale.text = text;
				scale.appendChild(text);

				this.scale.push(scale);
				this._elm.appendChild(scale);
			}
		},

		/**
		 * Update values of the scale.
		 *
		 * @method updateScale
		 */
		_updateScale : function() {
			var step = (this.max - this.min) / (this.scale.length - 1);

			for(var i = 0; i < this.scale.length; i++)
			{
				this.scale[(this.scale.length - 1) - i].text.data = this.min + (step * i);
			}
		},

		/**
		 * Add new graph line.
		 *
		 * @method addGraph
		 * @param {String} name Name of the graph.
		 * @param {Color} color Color of the graph.
		 */
		addGraph : function(name, color) {
			var canvas = document.createElement("canvas");
			canvas.style.position = "absolute";
			canvas.style.marginLeft = this.scaleMargin + "px";
			this._elm.appendChild(canvas);

			this.graph.push(new Graph.GaphLine(canvas, name, color));
		},

		/** 
		 * Attach onchange callback to a graph by its name.
		 *
		 * @method setOnChange
		 * @param {Function} onChange
		 * @param {String} name Graph name.
		 */
		setOnChange : function(onChange, name) 	{
			var graph = this.getGraph(name);
			graph.onchange = onChange;
		},

		/**
		 * Set value range of the graph.
		 *
		 * @method setRange.
		 * @param {Number} min
		 * @param {Number} max
		 */
		setRange : function(min, max) {
			this.min = min;
			this.max = max;

			//Limit graphs values
			for(var i in this.graph) {
				var graph = this.graph[i];

				for(var j = 0; j < graph.values.length; j++)
				{
					if(graph.values[j] < min)
					{
						graph.values[j] = min;

						if(graph.onchange !== null)
						{
							graph.onchange(graph.values);
						}
					}
					else if(graph.values[j] > max)
					{
						graph.values[j] = max;

						if(graph.onchange !== null)
						{
							graph.onchange(graph.values);
						}
					}
				}
			}

			this._updateScale();

			//Update grid to fit new scale
			for(var i = 0; i < this.graph.length; i++){
				this._updateGraph(this.graph[i]);
			}
		},

		/**
		 * Set values array to a graph using its name.
		 *
		 * @method setValue
		 * @param {Array} values Array of numeric values.
		 * @param {String} name Name of the graph line.
		 */
		setValue : function(values, name) {	
			var self = this;
			var graph = this.getGraph(name);

			//Set values
			graph.values = values;

			//Add buttons if necessary
			while(graph.buttons.length < graph.values.length){
				var button = document.createElement("div");
				button.style.borderRadius = "5px";
				button.style.backgroundColor = graph.color;
				button.style.cursor = "pointer";
				button.style.position = "absolute";
				button.style.marginTop = "-" + (this.buttonRadius / 2) + "px";
				button.style.marginLeft = (this.scaleMargin - (this.buttonRadius / 2)) + "px";
				button.style.width = this.buttonRadius + "px";
				button.style.height = this.buttonRadius + "px";
				button.index = graph.buttons.length;
				button.graph = graph;

				button.onmousedown = function(event) {
					var index = this.index;
					var graph = this.graph;
					//var manager = new EventManager();

					//manager.add(window, "mousemove", function(event)
					eventer.on(window, "mousemove", function(event) {
						var delta = event.movementY;

						graph.values[index] -= (delta * ((self.max - self.min) / self.size.y));

						if(graph.values[index] > self.max)	{
							graph.values[index] = self.max;
						}
						else if(graph.values[index] < self.min)	{
							graph.values[index] = self.min;
						}

						if(graph.onchange !== null)	{
							graph.onchange(graph.values);
						}
						self._updateGraph(graph);
					});

					//manager.add(window, "mouseup", function(event)
					//{	
					//	manager.destroy();
					//});
					//manager.create();

					event.stopPropagation();
				};

				this._elm.appendChild(button);
				graph.buttons.push(button);
			}

			//Remove buttons if necessary
			while(graph.buttons.length > graph.values.length){
				this._elm.removeChild(graph.buttons.pop());
			}

			//Check if new values are in range
			var update = false;
			for(var i = 0; i < values.length; i++)	{
				if(values[i] < this.min){
					this.min = Math.ceil(values[i]);
					update = true;
					break;
				}
				else if(values[i] > this.max){
					this.max = Math.ceil(values[i] + 1.0);
					update = true;
					break;
				}
			}

			//If some value not in range update range
			if(update)	{
				this.setRange(this.min, this.max);
			}

			//Update graph
			this._updateGraph(graph);
		},

		/**
		 * Return value array of a graph by its name.
		 *
		 * @method getValue
		 * @param {String} name Graph name.
		 */
		getValue : function(name) {
			var graph = this.getGraph(name);

			if(graph !== null)
			{
				return graph.values;
			}

			return null;
		},

		/**
		 * Get graph object by name.
		 *
		 * @method getGraph
		 * @param {String} name Graph name.
		 */
		getGraph : function(name) {
			if(name !== undefined) 	{
				for(var i = 0; i < this.graph.length; i++)
				{
					if(this.graph[i].name === name)
					{
						return this.graph[i];
					}
				}
			}

			if(this.graph.length > 0)
			{
				return this.graph[0];
			}

			return null;
		},

		/**
		 * Update graph canvas and buttons.
		 *
		 * @method updateGraph
		 * @param {Object} graph Graph object.
		 */
		_updateGraph : function(graph)
		{
			var width = this.size.x - this.scaleMargin;

			//Get canvas context
			var context = graph.canvas.getContext("2d");
			context.clearRect(0, 0, width, this.size.y);
			context.strokeStyle = graph.color;
			context.lineWidth = "2";

			//Draw graph and set button positions
			var step = width / (graph.values.length - 1);
			var delta = this.max - this.min;

			context.moveTo(0, graph.values[0] * this.size.y);
			context.beginPath();

			for(var i = 0; i < graph.values.length; i++)
			{
				var x = i * step;
				var y = (1 - ((graph.values[i] - this.min) / delta)) * this.size.y;

				context.lineTo(x, y);

				var button = graph.buttons[i];
				button.style.left = x + "px";
				button.style.top = y + "px";
			}

			context.stroke();
		},

		/**
		 * Draw background grid canvas.
		 *
		 * @method updateGrid
		 */
		_updateGrid : function() {
			var width = this.size.x - this.scaleMargin;

			var context = this.grid.getContext("2d");
			context.clearRect(0, 0, width, this.size.y);
			context.strokeStyle = "#222222";
			context.lineWidth = "1";

			//Border
			context.beginPath();
			context.rect(0, 0, width, this.size.y);
			context.stroke();
			context.moveTo(0, 0);

			var step = width / 10;
			if(step <= 0) {
				return;
			}

			//Vertical lines	
			for(var i = 0; i < width; i += step) {
				context.beginPath();
				context.moveTo(i, 0);
				context.lineTo(i, this.size.y);
				context.stroke();
			}

			//Horizontal lines
			for(var i = 0; i < this.size.y; i += step)	{
				context.beginPath();
				context.moveTo(0, i);
				context.lineTo(width, i);
				context.stroke();
			}
		},

		_updateSize : function() {
			Widget.prototype._updateSize.call(this);

			var width = this.size.x - this.scaleMargin;

			//Grid
			this.grid.width = width;
			this.grid.height = this.size.y;
			this.grid.style.width = width + "px";
			this.grid.style.height = this.size.y + "px";
			this._updateGrid();

			//Graph
			for(var i = 0; i < this.graph.length; i++)
			{
				var graph = this.graph[i];
				graph.canvas.width = width;
				graph.canvas.height = this.size.y;
				graph.canvas.style.width = width + "px";
				graph.canvas.style.height = this.size.y + "px";
				this._updateGraph(graph);
			}

			//Scale
			var step = (this.size.y - 14) / (this.scale.length - 1);
			for(var i = 0; i < this.scale.length; i++) {
				this.scale[i].style.top = (i * step) + "px";
			}
		}
	});

	Graph.GaphLine = function(canvas, name, color)
	{
		if(canvas === undefined)
		{
			canvas = document.createElement("canvas");
			canvas.style.position = "absolute";
		}

		this.canvas = canvas;
		this.name = (name !== undefined) ? name : "default";
		this.color = (color !== undefined) ? color : "#FFFFFF";
		this.values = [];
		this.buttons = [];
		this.onchange = null;
	};


	return graphics.Graph = Graph;
});
define('skylark-widgets-graphics/ImagePane',[
	"skylark-widgets-base/Widget",
	"./graphics"
],function(Widget,graphics){
	"use strict";

	/**
	 * image widget.
	 * 
	 * @class ImagePane
	 * @extends {Widget}
	 * @param {Widget} parent Parent widget.
	 */
	var ImagePane = Widget.inherit({

		_construct : function (parent) {
			Widget.prototype._construct.call(this, parent, "img");

			this._elm.style.borderStyle = "none";
			this._elm.style.objectFit = "contain"; //cover | fill
		},


		/**
		 * Set image from URL.
		 * 
		 * @method setImage
		 * @param {String} source Image URL.
		 */
		setImage : function(source) {
			this._elm.src = source;
		}
	});

	return graphics.ImagePane = ImagePane;
});
define('skylark-widgets-graphics/main',[
	"./graphics",
	"./Graph",
	"./ImagePane"
],function(graphics){
	return graphics;
});
define('skylark-widgets-graphics', ['skylark-widgets-graphics/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-widgets-graphics.js.map
