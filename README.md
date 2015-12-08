# Video Thumb Html 5
This npm create a thumb client side from a video (mp4/wbm/DASH) all in html5
**Compatibilities**

 1. Firefox
 2. Chrome
 3. IE TBD

**Method** 

**Param**

 1. Video url (mp4 or Dash)
 2. Time to get thumbnail in second


    thumbVideoFactory.getThumb("http://example.com/video.mp4",60, function (imgData) {
    document.getElementById('canvasImg4').src = imgData;
    });