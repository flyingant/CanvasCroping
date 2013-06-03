var CanvasCrop = {

    fileId:"file",

    canvasId: "canvas",

    getCanvas: function(){
        return document.getElementById(this.canvasId)
    },
    
    getOriginImage: function(){
        return this.originImage    
    },
    
    getCurrentImage: function(){
        return this.currentImage    
    },

    initialize: function(options){
        var self = this;
        this.canvasId = options.canvasId;
        this.targetCanvasId = options.targetCanvasId;
        this.fileId = options.fileId;
        var file = document.getElementById(this.fileId);
        file.addEventListener("change", function(event){
            var fileReader = new FileReader();
            fileReader.onload = function(event){
                self.originImage = document.createElement("img");
                self.originImage.id = "origin-image-seed-"+Math.random();
                self.originImage.onload = function () {
                    self.fillInCanvas();
                    document.getElementsByTagName("body")[0].appendChild(self.originImage);
                }
                self.originImage.src = event.target.result;
                self.originImage.style.position = 'absolute';
                self.originImage.style.top = '-10086px';
                self.originImage.style.left = '-10086px';
            };
            fileReader.readAsDataURL(event.target.files[0]);
        }, false);
    },

    fillInCanvas: function(){
        var self = this;
        var canvas = this.getCanvas();
        var originImage = this.getOriginImage();
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var imageWidth = originImage.width;
        var imageHeight = originImage.height;

        var scaleWidth = imageWidth < imageHeight;
        var scale = 1;
        if (scaleWidth) {
            scale = canvasWidth / imageWidth;
        } else {
            scale = canvasHeight / imageHeight;
        }
        var newImageWidth = imageWidth * scale;
        var newImageHeight = imageHeight * scale;
        var x = (canvasWidth - newImageWidth) / 2;
        var y = (canvasHeight - newImageHeight) / 2;

        var ctx = this.getCanvas().getContext('2d');
        ctx.drawImage(originImage, 0, 0, imageWidth, imageHeight, x, y, newImageWidth, newImageHeight);
        
        this.currentImage = document.createElement("img");
        this.currentImage.id = "current-image-seed-"+Math.random();
        this.currentImage.onload = function(){
            canvas.setAttribute("data-origin-image-id", originImage.id);
            canvas.setAttribute("data-current-image-id", self.currentImage.id);
            canvas.setAttribute("data-current-image-offset-left", self.currentImage.offsetLeft);
            canvas.setAttribute("data-current-image-offset-top", self.currentImage.offsetTop);
        }
       this.currentImage.src = canvas.toDataURL();
    },

    enableCrop: function(){
        var canvas = this.getCanvas();
        var ctx = this.getCanvas().getContext('2d');
        ctx.fillStyle = 'rgba( 0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        canvas.setAttribute("data-croping", "false");
        canvas.addEventListener("mousedown", this.mouseDownHandle, false);
        canvas.addEventListener("mouseup", this.mouseUpHandle, false);
        canvas.addEventListener("mousemove", this.mouseMoveHandle, false);
    },

    disableCrop: function(){
        var canvas = this.getCanvas();
        this.fillInCanvas();
        canvas.removeEventListener("mousedown", this.mouseDownHandle, false);
        canvas.removeEventListener("mouseup", this.mouseUpHandle, false);
        canvas.removeEventListener("mousemove", this.mouseMoveHandle, false);
    },

    mouseDownHandle: function(event){
        var canvas = document.getElementById(event.target.id);
        canvas.setAttribute("data-croping", "true");
        canvas.setAttribute("data-crop-area-x", event.offsetX - canvas.getAttribute("data-current-image-offset-left"));
        canvas.setAttribute("data-crop-area-y", event.offsetY - canvas.getAttribute("data-current-image-offset-top"));
    },

    mouseUpHandle: function(event){
        var canvas = document.getElementById(event.target.id);
        canvas.setAttribute("data-croping", "false");
    },

    mouseMoveHandle: function(event){
        var canvas = document.getElementById(event.target.id);
        if(canvas.getAttribute("data-croping") === "true"){
            var originImage = document.getElementById(canvas.getAttribute("data-origin-image-id"));
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            var imageWidth = originImage.width;
            var imageHeight = originImage.height;

            var scaleWidth = imageWidth < imageHeight;
            var scale = 1;
            if (scaleWidth) {
                scale = canvasWidth / imageWidth;
            } else {
                scale = canvasHeight / imageHeight;
            }
            var newImageWidth = imageWidth * scale;
            var newImageHeight = imageHeight * scale;
            var ctx = canvas.getContext('2d');
            var x = (canvasWidth - newImageWidth) / 2;
            var y = (canvasHeight - newImageHeight) / 2;
            ctx.drawImage(originImage, 0, 0, imageWidth, imageHeight, x, y, newImageWidth, newImageHeight);
            
            var cropArea ={
                x: 0,
                y: 0,
                x1: 0,
                y1: 0
            };
            cropArea.x = Number(canvas.getAttribute("data-crop-area-x"));
            cropArea.y = Number(canvas.getAttribute("data-crop-area-y"));
            cropArea.x1 = event.offsetX - canvas.getAttribute("data-current-image-offset-left") - cropArea.x;
            cropArea.y1 = event.offsetY - canvas.getAttribute("data-current-image-offset-top") - cropArea.y;
            
            canvas.setAttribute("data-crop-area-x1", cropArea.x1);
            canvas.setAttribute("data-crop-area-y1", cropArea.y1);
            
            ctx.fillStyle = 'rgba( 0,0,0,0.8)';
            ctx.fillRect( 0, 0, cropArea.x, newImageHeight );
            ctx.fillRect( (cropArea.x + cropArea.x1), 0, (newImageWidth - cropArea.x1), newImageHeight );
            ctx.fillRect( cropArea.x, 0, cropArea.x1, cropArea.y );
            ctx.fillRect( cropArea.x, (cropArea.y + cropArea.y1), cropArea.x1, (newImageHeight - cropArea.y1) );
        }
    },

    crop: function(){
        var canvas = this.getCanvas(), targetCanvas;
        var cropArea ={
            x: Number(canvas.getAttribute("data-crop-area-x")),
            y: Number(canvas.getAttribute("data-crop-area-y")),
            x1: Number(canvas.getAttribute("data-crop-area-x1")),
            y1: Number(canvas.getAttribute("data-crop-area-y1"))
        };
        
        if(this.targetCanvasId){
            targetCanvas = document.getElementById(this.targetCanvasId);    
        } else {
            targetCanvas = canvas;    
        }
        
        targetCanvas.width = cropArea.x1;
        targetCanvas.height = cropArea.y1;
        
        var ctx = targetCanvas.getContext('2d');
        ctx.drawImage(this.getCurrentImage(), 
        cropArea.x, cropArea.y,
        cropArea.x1, cropArea.y1,
        0, 0,
        cropArea.x1, cropArea.y1);
        
        // the code as following can help to get the size of the crop image
        /*
        var base64Image = targetCanvas.toDataURL().split("data:image/png;base64,")[1];
        var blob2 = new Blob([atob(base64Image)],{type:"image/png"});
        console.log("Size: ", blob2.size);
        */
    },
    
    errorHandle: function(errorCode, callback){
        
    }



}