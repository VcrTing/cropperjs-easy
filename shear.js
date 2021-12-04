// Author: vcrting@163.com
var Shear = (function(ratio) {
    this.speed = 0.2;
    this._ratio = ratio;

    this._scrollTimer;
    this.img = document.getElementById('cropper_easy_inner_img');
    this.shear = document.getElementById('cropper_easy_inner_window');

    // 工具
    this._wh = function() { this.s_w = this.shear.clientWidth; this.s_h = this.shear.clientHeight; }  
    this._location = function() {
        return [ this.shear.offsetLeft - (this.shear.clientWidth / 2), this.shear.offsetTop - (this.shear.clientHeight / 2) ]
    }   
    this._set_shear = function(w) { this.shear.style.width = w + 'px'; this.shear.style.height = (w / this._ratio) + 'px'; }

    this.init = function() {
        this.i_w = this.img.clientWidth;
        this.i_h = this.img.clientHeight;
        // 绑定 剪裁框 拖动 方法
        this.mousemove();
        // 初始化 剪裁框
        this.reset()
        // 绑定 滚动 缩放
        this.scroll()
    }
    /* 
        初始化 与 最终化
    */
    this.reset = function() {
        this.shear.style.left = '50%';
        this.shear.style.right = '50%';
        this.shear.style.width = '100%';
        this.shear.style.height = '100%';
        this.set_shear_zoom(this.i_w, 1);
        this.set_shear_zoom(this.i_w, 1);
        this.img.style.clipPath = `inset(0px 0px 0px 0px)`;

        this._fix_location();
    }
    this.result = function() {
        this._wh();
        var xy = this._location();
        return this._draw( this.img, xy[0], xy[1], this.s_w, this.s_h );
    }

    /* 
        缩放
    */
    this.set_shear_zoom = function(w, s) {
        w = s >= 0 ? this._beyond_zoom(w, this._ratio) : w;
        w = w < 60 ? 60 : w;
        this.shear.style.width = w + 'px';
        this.shear.style.height = (w / this._ratio).toFixed(4) + 'px';
    }
    this._beyond_zoom = function(w, ratio) {
        this._wh();
        var i_w = this.i_w;
        var i_h = this.i_h;
        var w_res = this.s_w >= i_w;
        var h_res = this.s_h >= i_h;
        
        if (w_res && h_res) {
            w = ((i_w - i_h) >= 0) ? (i_h * ratio) : i_w ;
        } else {
            if (w_res && !h_res) {
                w = i_w;
            } else if (!w_res && h_res) {
                w = (i_h + 1) * ratio;
            }
        }
        return w;
    }
    this.zoom = function(s) {
        this._wh();
        s = s * this.speed;
        var w = this.s_w + s;
        this.set_shear_zoom(w, s);
    }
    this.scroll = function() {
        var _this = this;
        var _dom = this.shear;
        var func = function(e) {
            clearTimeout(_this._scrollTimer);
            e = e || window.event;
            e.preventDefault && e.preventDefault();
            _this.zoom(e.deltaY);
            _this._scrollTimer = setTimeout(function() {
                _this._fix_location();
            }, 300);
        }
        if (_dom.addEventListener) { _dom.addEventListener('DOMmoudeScroll', func, false); }
        _dom.onmousewheel = func;
    }
    // 修正超出屏幕
    this._fix_location = function() {
        this._wh();
        var x = this._location()[0] + (this.s_w / 2);
        var y = this._location()[1] + (this.s_h / 2);
        var byd = this.set_shear_move(x, y);
    }
    
    /*
        移动 
    */
    this.set_shear_move = function(x, y) {
        this._wh();
        var byd = this._beyond_move(x, y, this.i_w, this.i_h);
        this.shear.style.top = byd[1] + 'px';
        this.shear.style.left = byd[0] + 'px';
    }
    this._beyond_move = function(x, y, _i_w, _i_h) {
        var w_05 = this.s_w / 2;
        var h_05 = this.s_h / 2;

            x = x <= w_05 ? w_05 : x;
            x = (x + w_05) > (_i_w) ? (_i_w - w_05) : x;
            y = y < (h_05 + 0.5) ? (h_05 - 0.5) : y;
            y = (y + h_05) > _i_h ? (_i_h - h_05) : y;

        return [ x, y];
    }
    this.mousemove = function() {
        var _dom = this.shear;
        var _this = this;
        var disX = 0;
        var disY = 0;
        _dom.onmousedown = function(ev) {
            var e = ev || event;
            disX = e.clientX - _dom.offsetLeft;
            disY = e.clientY - _dom.offsetTop;
            document.onmousemove = function(ev) { // document.onmousemove可避免鼠标移动的块位置问题
                var _e = ev || event;
                _this.set_shear_move(
                    _e.clientX - disX,
                    _e.clientY - disY
                );
            };
            document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; }
        }
    }

    // 剪裁
    this.clipping = function() {
        this._wh();
        var xy = this._location();
        var _t = xy[1] - this.img.offsetTop;
        var _l = xy[0] - this.img.offsetLeft;
        this._crop_img(
            _t,
            ( this.i_h - this.s_h - _t ), // bottom
            _l,
            ( this.i_w - this.s_w - _l ), // righg
        );
    }
    this._crop_img = function(t, b, l, r) {
        this.img.style.clipPath = 'inset(' + t + 'px, ' + r + 'px, ' + b + 'px, ' + l + 'px)';
    }

    // 绘图
    this._mapping_draw = function(_img, x, y, w, h, w_ntr, h_ntr) {
        w = w / this.i_w * w_ntr;
        h = h / this.i_h * h_ntr;
        x = x / this.i_w * w_ntr;
        y = y / this.i_w * w_ntr;
        x = x < 0 ? 0 : x; 
        y = y < 0 ? 0 : y;
        h = this._ratio == 1 ? w : h;
        return [ x, y, w, h];
    },
    this._draw = function(_img, x, y, w, h) {
        var w_ntr = _img.naturalWidth;
        var h_ntr = _img.naturalHeight;
        var _map = this._mapping_draw(_img, x, y, w, h, w_ntr, h_ntr);
        x = _map[0];
        y = _map[1];
        w = _map[2];
        h = _map[3];

        var cv = document.createElement("canvas");
        cv.width = (w + x) > w_ntr ? (w_ntr - x) : w;
        cv.height = (h + y) > h_ntr ? (h_ntr - y) : h;
        cv.height = this._ratio == 1 ? cv.width : cv.height;

        cv.getContext("2d").drawImage(_img,
            x, y, 
            w_ntr, h_ntr,
            0, 0,
            w_ntr, h_ntr
        );
        return cv.toDataURL();
    },

    // 拓展 头像功能
    this.circular = function() {
        this._ratio = 1;
        this.reset();
        this.shear.classList.add('cropper_easy_circular');
    }
})