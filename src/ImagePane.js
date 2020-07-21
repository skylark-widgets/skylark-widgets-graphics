define([
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