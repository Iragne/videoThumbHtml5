// babel --watch   -o index2.js index.es6
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ThumbRequest = (function () {
	function ThumbRequest(url, time, cb) {
		_classCallCheck(this, ThumbRequest);

		this.url = url;
		this.time = time;
		this.cb = cb;
		this.data = undefined;
	}

	_createClass(ThumbRequest, [{
		key: 'extract',
		value: function extract(divId) {
			var back = document.createElement('canvas');
			back.crossorigin = 'anonymous';
			divId.crossorigin = 'anonymous';
			var backcontext = back.getContext('2d');
			backcontext.crossorigin = '';
			back.height = divId.clientHeight;
			back.width = divId.clientWidth;
			backcontext.drawImage(this.divId, 0, 0, divId.clientWidth, divId.clientHeight);
			var data = back.toDataURL();
			return data;
		}
	}, {
		key: 'run',
		value: function run(player, divId, callback) {
			this.divId = divId;
			var fctSeek = (function () {
				player.off("seeked", fctSeek);
				player.pause();
				var data = this.extract(this.divId);
				this.data = data;
				callback(data);
			}).bind(this);
			var fctLoad = (function () {
				player.off("loadedmetadata", fctLoad);
				player.play();
				player.pause();
				player.currentTime(this.time);
			}).bind(this);
			player.on("loadedmetadata", fctLoad);
			player.on("seeked", fctSeek);

			if (this.url.indexOf(".mpd") >= 0) player.src({ src: this.url, type: "application/dash+xml" });else player.src(this.url);
			player.muted(true);
		}
	}]);

	return ThumbRequest;
})();

var ThumbVideo = (function () {
	function ThumbVideo() {
		_classCallCheck(this, ThumbVideo);

		this.buffer = [];
		this.video = undefined;
		this.processCount = 0;
	}

	_createClass(ThumbVideo, [{
		key: 'setupPlayer',
		value: function setupPlayer(callback) {
			if (this.video === undefined) {
				var e = document.createElement("div");
				e.id = "divThumbVideoPlaceHoler";
				e.style.width = "10px";
				e.style.height = "10px";
				e.style.overflow = "hidden";
				e.style.display = "block";
				e.style.position = "absolute";
				e.style.top = "0px";
				e.style.left = "-500px";
				e.innerHTML = '<video  data-setup="{}"  style="" id="ThumbVideoPlaceHoler"  crossOrigin="anonymous" class="video-js vjs-default-skin" controls preload="auto" width="640" height="360" ></video>';
				window.document.body.appendChild(e);
				this.video = document.getElementById("ThumbVideoPlaceHoler");
				this.video.crossOrigin = "anonymous";
				var self = this;
				videojs(this.video, {}, function () {
					self.videojs = this;
					this.muted(true);
					this.firstFire = true;
					callback();
				});
			} else callback();
		}
	}, {
		key: 'getThumb',
		value: function getThumb(url, time, cb) {
			this.setupPlayer((function () {
				var request = new ThumbRequest(url, time, cb);
				this.buffer.push(request);
				if (this.buffer.length > 0 && this.processCount === 0 && this.videojs !== undefined) {
					// console.log("process", url, time);
					this.processCount++;
					this.process();
				}
			}).bind(this));
		}
	}, {
		key: 'getThumbDiv',
		value: function getThumbDiv(domElt) {
			return new ThumbRequest("", 0, function () {}).extract(domElt);
		}
	}, {
		key: 'process',
		value: function process() {
			if (this.buffer.length === 0) return;
			var elt = this.buffer[0];
			elt.run(this.videojs, this.video, (function () {
				this.processCount--;
				this.buffer.shift();
				this.process();
				elt.cb(elt.data);
			}).bind(this));
		}
	}]);

	return ThumbVideo;
})();

window.thumbVideoFactory = new ThumbVideo();
