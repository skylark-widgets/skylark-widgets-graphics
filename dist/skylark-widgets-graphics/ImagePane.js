/**
 * skylark-widgets-graphics - The skylark graphic widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-graphics/
 * @license MIT
 */
define(["skylark-widgets-base/Widget","./graphics"],function(t,e){"use strict";var i=t.inherit({_construct:function(e){t.prototype._construct.call(this,e,"img"),this._elm.style.borderStyle="none",this._elm.style.objectFit="contain"},setImage:function(t){this._elm.src=t}});return e.ImagePane=i});
//# sourceMappingURL=sourcemaps/ImagePane.js.map
