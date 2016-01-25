// babel --watch   -o index2.js index.es6
"use strict"

class ThumbRequest {
   constructor (url, time, cb){
      this.url = url;
      this.time = time;
      this.cb = cb;
      this.data = undefined;
   }
   extract(divId){
      var back = document.createElement('canvas');
      back.crossorigin='anonymous';
      divId.crossorigin='anonymous';
      var backcontext = back.getContext('2d');
      backcontext.crossorigin='';
      back.height = divId.clientHeight;
      back.width = divId.clientWidth;
      backcontext.drawImage(divId, 0, 0, divId.clientWidth, divId.clientHeight);
      var data = back.toDataURL();
      return data;
   }
   run (player, divId,callback){
      this.divId = divId;
      var fctSeek = function (){
         player.off("seeked",fctSeek);
         player.pause();
         var data = this.extract(this.divId);
         this.data = data;
         callback(data);
      }.bind(this);
      var fctLoad = function (){
         player.off("loadedmetadata",fctLoad);
         player.play();
         player.pause();
         player.currentTime(this.time);
      }.bind(this);
      player.on("loadedmetadata",fctLoad);
      player.on("seeked",fctSeek);
      
      if (this.url.indexOf(".mpd") >= 0)
         player.src({src:this.url,type:"application/dash+xml"});
      else
         player.src(this.url);
      player.muted(true);
      
   }
}
class ThumbVideo {
   constructor(){
      this.buffer = [];
      this.video = undefined;
      this.processCount = 0;
   }
   setupPlayer (options,callback){
      if (this.video === undefined){
         var e = document.createElement("div");
         e.id = "divThumbVideoPlaceHoler";
         e.style.width = "10px";
         e.style.height= "10px";
         e.style.overflow= "hidden";
         e.style.display= "block";
         e.style.position= "absolute";
         e.style.top= "0px";
         e.style.left= "-500px";
         e.innerHTML = '<video  data-setup="{}"  style="" id="ThumbVideoPlaceHoler"  crossOrigin="anonymous" class="video-js vjs-default-skin" controls preload="auto" width="640" height="360" ></video>';
         window.document.body.appendChild(e);
         this.video = document.getElementById("ThumbVideoPlaceHoler");
         this.video.crossOrigin = "anonymous";
         var self = this;
         videojs(this.video, options, function (){
            self.videojs = this;
            this.muted(true);
            this.firstFire = true;
            callback();
         });
      }else
         callback();
   }
   getThumb(url, time, cb, options={} ){
      this.setupPlayer(options, function (){
         var request = new ThumbRequest(url, time, cb);
         this.buffer.push(request);
         if ((this.buffer.length > 0 && this.processCount === 0) && this.videojs !== undefined){
            // console.log("process", url, time);
            this.processCount++;
            this.process();
         }
      }.bind(this));
   }
   getThumbDiv(domElt){
      return (new  ThumbRequest("", 0, function(){})).extract(domElt);
   }
   process(){
      // if you want to recall your getThumb function after a complete processing, you have to reinitilize processCount.
      if (this.buffer.length === 0){
         this.processCount=0;
         return;
      }
      var elt = this.buffer[0];
      elt.run(this.videojs, this.video, function () {
         this.processCount--;
         this.buffer.shift();
         this.process();
         elt.cb(elt.data);
      }.bind(this));
   }
}

window.thumbVideoFactory = new ThumbVideo();
