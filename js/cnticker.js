CNTicker = function (element, options) {

    this.options = {
        label: '',
        withLabel: false,
        speed: 30,
        pauseOnHover: false,
        animation: 'marquee',
        dir: 'ltr',
        transition: 5000,
        withSeparators: true,
        cursorSpeed: 10,
        fontSize: 16,
        labelFontSize: 20,
        labelColor: "#1565c0",
        borderColor: "#1976d2",
        textColor: "#FFF",
        background: "linear-gradient(90deg, #64b5f6, #1976d2)"
    }

    this.init = function () {
        this.element = element;
        this.setOptions();
        this.generateCss();
        this.build();
        this.animate();
    }

    this.setOptions = function () {
        this.setOptionsFromAttributes();
        this.setOptionsFromObject(options);
    }

    this.setOptionsFromAttributes = function () {
        var attributes = this.element.dataset;
        for (var key in attributes) {
            if(!key.startsWith("cnticker")) continue;

            this.options[this.getFormattedKey(key)] = attributes[key];
        }
    }

    this.getFormattedKey = function (key) {
        var finalKey = key.replace('cnticker', '');
        finalKey = finalKey.charAt(0).toLowerCase() + finalKey.slice(1);
        return finalKey;
    }

    this.setOptionsFromObject = function (options) {
        for (var key in options) {
            this.options[key] = options[key];
        }
    }

    this.build = function () {
        var children = this.element.children;
        var childrenHTML = '';
        for (var i = 0; i < children.length; i++) {
            childrenHTML += children[i].outerHTML;
        }
        this.itemsCount = children.length;
        this.wrapper = document.createElement('div');
        this.wrapper.style = `background: ${this.options.background}; border: 1px solid ${this.options.borderColor};`;
        this.wrapper.setAttribute('class', 'cnticker');
        var labelStyle = `font-size: ${this.options.labelFontSize}px; background-color: ${this.options.labelColor}; border-right: 2px solid ${this.options.borderColor};`
        if(this.options.dir == 'rtl') {
            this.wrapper.classList.add('cnticker-rtl');
            labelStyle = `font-size: ${this.options.labelFontSize}px; background-color: ${this.options.labelColor}; border-left: 2px solid ${this.options.borderColor};`
        }
        if(this.options.withSeparators == "false" || this.options.withSeparators == "0") this.wrapper.classList.add('cnticker-no-separators');
        if(this.options.withLabel == "false" || this.options.withLabel == "0") this.options.withLabel = false;
        if(this.options.pauseOnHover == "false" || this.options.pauseOnHover == "0") this.options.pauseOnHover = false;
        this.wrapper.innerHTML = `
            ${this.options.withLabel ? `<label class="cnticker-label" style="${labelStyle}">${this.options.label}</label>` : ''}
            <div class="cnticker-container">
                <div class="cnticker-lists" style="font-size: ${this.options.fontSize}px; color: ${this.options.textColor};">
                    <ul class='cnticker-list'>
                        ${childrenHTML}
                    </ul>
                    <ul class='cnticker-list'>
                        ${childrenHTML}
                    </ul>
                </div>
            </div>
            `;
        this.element.parentNode.insertBefore(this.wrapper, this.element);
        this.element.remove();
        this.currentPosition = 0;
        this.lists = this.wrapper.querySelector('.cnticker-lists');

        if(this.options.pauseOnHover)
            this.setPauseOnHover();
    }

    this.setPauseOnHover = function () {
        this.wrapper.addEventListener('mouseover', () => {
            clearInterval(this.interval);
        });
        this.wrapper.addEventListener('mouseout', () => {
            this.animate(false)
        });
    }

    this.animate = function (init = true) {
        switch(this.options.animation) {
            case 'marquee':
                this.animateMarquee(init);
                break;
            case 'up':
                this.animateUp(init);
                break;
            case 'down':
                this.animateDown(init);
                break;
            case 'write':
                this.animateWrite(init);
                break;
            default:
                this.animateMarquee(init);
        }
    }

    this.animateMarquee = function (init) {
        if(init) {
            this.currentPosition = 0;
        }

        if(this.options.dir == 'rtl') {
            this.setIntervalRtl();
        } else {
            this.setIntervalLtr();
        }
    }

    this.setIntervalLtr = function () {
        this.interval = setInterval(() => {
            if(this.isTimeToRotateLtr()) {
                this.rotate();
            } else {
                this.lists.style.left = this.currentPosition + 'px';
                this.currentPosition -= this.options.speed / 100.0;
            }
        }, 10);
    }

    this.setIntervalRtl = function () {
        this.interval = setInterval(() => {
            if(this.isTimeToRotateRtl()) {
                this.rotate();
            } else {
                this.lists.style.right = this.currentPosition + 'px';
                this.currentPosition -= this.options.speed / 100.0;
            }
        }, 10);
    }

    this.isTimeToRotateLtr = function () {
        return -this.currentPosition >= this.lists.offsetWidth / 2;
    }
    
    this.isTimeToRotateRtl = function () {
        return -this.currentPosition >= this.lists.offsetWidth / 2;
    }

    this.rotate = function () {
        this.currentPosition =  0;
    }

    this.rotateUp = function() {
        setTimeout(() => {
            var tempTransition = this.lists.style.transition;
            this.lists.style.transition = "0s";
            this.currentPosition =  0;
            this.lists.style.top = 0;
            setTimeout(() => {
                this.lists.style.transition = tempTransition;
            })
        }, 500)
    }

    this.rotateDown = function() {
        setTimeout(() => {
            var tempTransition = this.lists.style.transition;
            this.lists.style.transition = "0s";
            this.currentPosition =  0;
            this.lists.style.bottom = 0;
            setTimeout(() => {
                this.lists.style.transition = tempTransition;
            })
        }, 500)
    }

    this.animateUp = function (init) {
        if(init) {
            this.wrapper.classList.add("cnticker-up");
            this.lists.style.top = 0;
        }
        this.interval = setInterval(() => {
            this.currentPosition -= 100;
            this.lists.style.top = this.currentPosition + '%';

            if(this.isTimeToRotateUp()) {
                this.rotateUp();
            }
        }, this.options.transition);
    }

    this.isTimeToRotateUp = function () {
        return this.currentPosition <= -100 * this.itemsCount;
    }

    this.animateDown = function (init) {
        if(init) {
            this.wrapper.classList.add("cnticker-down");
            this.lists.style.bottom = 0;
        }
        this.interval = setInterval(() => {
            this.currentPosition -= 100;
            this.lists.style.bottom = this.currentPosition + '%';

            if(this.isTimeToRotateDown()) {
                this.rotateDown();
            }
        }, this.options.transition);
    }

    this.isTimeToRotateDown = function () {
        return this.currentPosition <= -100 * this.itemsCount;
    }

    this.animateWrite = function(init) {
        if(init) {
            this.wrapper.classList.add("cnticker-write");
            this.texts = [];
            for (var item of this.lists.children[0].children) {
                this.texts.push(item.textContent);
            }
    
            for(var i = 0; i < this.texts.length; i++) {
                this.lists.children[0].children[0].remove();
                this.lists.children[1].children[0].remove();
            }
    
            this.writeElement = document.createElement('li');
            this.lists.children[0].append(this.writeElement);
        }

        this.interval = setInterval(() => {
            if(this.isTimeToRotateWrite()) {
                this.rotateWrite();
            }
            this.writeText();
        }, this.options.transition);
    }

    this.isTimeToRotateWrite = function () {
        return this.currentPosition >= this.itemsCount - 1;
    }

    this.writeText = function () {
        var i = 0;
        var length = this.texts[this.currentPosition].length;
        var writeInteval = setInterval(() => {
            if(i > length) {
                clearInterval(writeInteval);
                this.currentPosition ++;
                return;
            }
            this.writeElement.textContent = this.texts[this.currentPosition].slice(0, i);
            i++;
        }, this.options.cursorSpeed)
    }

    this.rotateWrite = function () {
        this.currentPosition = 0;
    }

    this.generateCss = function () {
        var css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = `.cnticker {
    display: flex;
    align-items: stretch;
    font-family: Arial, sans-serif;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    position: relative;
    transition: all 0.3s ease-in-out;
    height: 46px;
    box-sizing: content-box;
}

.cnticker-rtl {
    direction: rtl;
}

.cnticker-label {
    font-weight: bold;
    color: #fff;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    text-transform: uppercase;
    z-index: 1;
    position: relative;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    letter-spacing: 1px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease-in-out;
}

.cnticker-rtl .cnticker-label {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    border-right: 0;
}

.cnticker-container {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    transition: all 0.3s ease-in-out;
}

.cnticker-lists {
    position: absolute;
    display: flex;
}

.cnticker-up .cnticker-lists, .cnticker-down .cnticker-lists {
    display: block;
    transition: all 0.3s ease-in-out;
}

.cnticker-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 30px;
    align-items: center;
    white-space: nowrap;
    margin-inline-start: 15px;
    transition: all 0.3s ease-in-out;
}

.cnticker-up .cnticker-list, .cnticker-down .cnticker-list {
    display: block;
}

.cnticker-up .cnticker-container, .cnticker-down .cnticker-container {
    align-items: unset;
}

.cnticker-list li {
    font-weight: 600;
    position: relative;
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;
    line-height: 46px;
}

.cnticker-up .cnticker-list li, .cnticker-down .cnticker-list li {
    height: 100%;
}

.cnticker-no-separators .cnticker-list li::after {
    display: none;
}

.cnticker-list li::after {
    content: "";
    margin-inline-start: 20px;
    width: 12px;
    height: 12px;
    display: inline-block;
    border-radius: 50%;
    background-color: #bdbdbd;  /* Light gray for dots */
    border: 2px solid #ffffff;
    transition: background-color 0.3s ease;
}

.cnticker-up .cnticker-list li::after, .cnticker-down .cnticker-list li::after, .cnticker-write .cnticker-list li::after {
    display: none;
}`;

        document.head.appendChild(css);
    }

    this.init();
}