/**
 * skylark-widgets-graphics - The skylark graphic widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-graphics/
 * @license MIT
 */
define(["skylark-domx-eventer","skylark-widgets-base/widget","./graphics"],function(t,e,i){"use strict";var s=e.inherit({_construct:function(t,i,s){e.prototype._construct.call(this,t,"div");this._elm.style.overflow="visible",this.scaleMargin=22,this.buttonRadius=10,this.max=1,this.min=0,this.grid=document.createElement("canvas"),this.grid.style.position="absolute",this.grid.style.marginLeft=this.scaleMargin+"px",this._elm.appendChild(this.grid),this.graph=[],this.addGraph(i,s),this.scale=[],this.createScale(3)},createScale:function(t){for(var e=0;e<this.scale;e++)this._elm.removeChild(this.scale[e]);var i=(this.max-this.min)/(t-1);for(e=0;e<t;e++){var s=document.createElement("div");s.style.position="absolute",s.style.pointerEvents="none",s.style.color=Editor.theme.textColor;var a=document.createTextNode(this.max-i*e);s.text=a,s.appendChild(a),this.scale.push(s),this._elm.appendChild(s)}},_updateScale:function(){for(var t=(this.max-this.min)/(this.scale.length-1),e=0;e<this.scale.length;e++)this.scale[this.scale.length-1-e].text.data=this.min+t*e},addGraph:function(t,e){var i=document.createElement("canvas");i.style.position="absolute",i.style.marginLeft=this.scaleMargin+"px",this._elm.appendChild(i),this.graph.push(new s.GaphLine(i,t,e))},setOnChange:function(t,e){this.getGraph(e).onchange=t},setRange:function(t,e){for(var i in this.min=t,this.max=e,this.graph)for(var s=this.graph[i],a=0;a<s.values.length;a++)s.values[a]<t?(s.values[a]=t,null!==s.onchange&&s.onchange(s.values)):s.values[a]>e&&(s.values[a]=e,null!==s.onchange&&s.onchange(s.values));this._updateScale();for(i=0;i<this.graph.length;i++)this._updateGraph(this.graph[i])},setValue:function(e,i){var s=this,a=this.getGraph(i);for(a.values=e;a.buttons.length<a.values.length;){var h=document.createElement("div");h.style.borderRadius="5px",h.style.backgroundColor=a.color,h.style.cursor="pointer",h.style.position="absolute",h.style.marginTop="-"+this.buttonRadius/2+"px",h.style.marginLeft=this.scaleMargin-this.buttonRadius/2+"px",h.style.width=this.buttonRadius+"px",h.style.height=this.buttonRadius+"px",h.index=a.buttons.length,h.graph=a,h.onmousedown=function(e){var i=this.index,a=this.graph;t.on(window,"mousemove",function(t){var e=t.movementY;a.values[i]-=e*((s.max-s.min)/s.size.y),a.values[i]>s.max?a.values[i]=s.max:a.values[i]<s.min&&(a.values[i]=s.min),null!==a.onchange&&a.onchange(a.values),s._updateGraph(a)}),e.stopPropagation()},this._elm.appendChild(h),a.buttons.push(h)}for(;a.buttons.length>a.values.length;)this._elm.removeChild(a.buttons.pop());for(var n=!1,l=0;l<e.length;l++){if(e[l]<this.min){this.min=Math.ceil(e[l]),n=!0;break}if(e[l]>this.max){this.max=Math.ceil(e[l]+1),n=!0;break}}n&&this.setRange(this.min,this.max),this._updateGraph(a)},getValue:function(t){var e=this.getGraph(t);return null!==e?e.values:null},getGraph:function(t){if(void 0!==t)for(var e=0;e<this.graph.length;e++)if(this.graph[e].name===t)return this.graph[e];return this.graph.length>0?this.graph[0]:null},_updateGraph:function(t){var e=this.size.x-this.scaleMargin,i=t.canvas.getContext("2d");i.clearRect(0,0,e,this.size.y),i.strokeStyle=t.color,i.lineWidth="2";var s=e/(t.values.length-1),a=this.max-this.min;i.moveTo(0,t.values[0]*this.size.y),i.beginPath();for(var h=0;h<t.values.length;h++){var n=h*s,l=(1-(t.values[h]-this.min)/a)*this.size.y;i.lineTo(n,l);var r=t.buttons[h];r.style.left=n+"px",r.style.top=l+"px"}i.stroke()},_updateGrid:function(){var t=this.size.x-this.scaleMargin,e=this.grid.getContext("2d");e.clearRect(0,0,t,this.size.y),e.strokeStyle="#222222",e.lineWidth="1",e.beginPath(),e.rect(0,0,t,this.size.y),e.stroke(),e.moveTo(0,0);var i=t/10;if(!(i<=0)){for(var s=0;s<t;s+=i)e.beginPath(),e.moveTo(s,0),e.lineTo(s,this.size.y),e.stroke();for(s=0;s<this.size.y;s+=i)e.beginPath(),e.moveTo(0,s),e.lineTo(t,s),e.stroke()}},_updateSize:function(){e.prototype._updateSize.call(this);var t=this.size.x-this.scaleMargin;this.grid.width=t,this.grid.height=this.size.y,this.grid.style.width=t+"px",this.grid.style.height=this.size.y+"px",this._updateGrid();for(var i=0;i<this.graph.length;i++){var s=this.graph[i];s.canvas.width=t,s.canvas.height=this.size.y,s.canvas.style.width=t+"px",s.canvas.style.height=this.size.y+"px",this._updateGraph(s)}var a=(this.size.y-14)/(this.scale.length-1);for(i=0;i<this.scale.length;i++)this.scale[i].style.top=i*a+"px"}});return s.GaphLine=function(t,e,i){void 0===t&&((t=document.createElement("canvas")).style.position="absolute"),this.canvas=t,this.name=void 0!==e?e:"default",this.color=void 0!==i?i:"#FFFFFF",this.values=[],this.buttons=[],this.onchange=null},i.Graph=s});
//# sourceMappingURL=sourcemaps/graph.js.map
