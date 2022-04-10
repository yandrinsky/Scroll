class _Scroll{
    constructor(root) {
        this.root = root
        this.content = this.root.children[0];
        this.scrollLine = document.createElement("div")
        this.progress = document.createElement("div")
        this.innerHeight = undefined
        this.percentElement = undefined

    }

    prepare(settings) {
        this.root.style = `position: relative; 
                        overflow: hidden;
                        box-sizing: border-box;
                        ${settings.global ? `height: 100vh` : ``}
                        `;

        this.content.style = ` transition: top 0.1s ease;
                                position: absolute;
                                left: 0;
                                top: 0;`;
        this.scrollLine.style = `
            position: absolute;
            right: 0;
            opacity: ${settings.opacity || settings.opacity === 0 ? settings.opacity : "0.7"};
            height: 100%;
            width: ${settings.width ?  settings.width : "5px"};
            background: ${settings.scrollLineBackground ? settings.scrollLineBackground : "#ccc"};
            z-index: 1000;
            cursor: pointer;
        `
        this.progress.style = `
            z-index: 1001;
            ${settings.global ? `position: fixed` : `position: absolute`};
            width: ${settings.width ?  settings.width : "5px"};
            right: 0;
            top: 0;
            background: ${settings.progressBackground ? settings.progressBackground : "rgb(255,58,69)"};
            
        `
        this.scrollLine.classList.add("scrollLine");
        this.progress.classList.add("progress");
        this.scrollLine.insertAdjacentElement("afterbegin", this.progress);
        this.root.insertAdjacentElement("afterbegin", this.scrollLine)
        this.innerHeight = this.root.getBoundingClientRect().height;
    }

    scrollProgress = margin => {
        let {height} = this.content.getBoundingClientRect();
        let bottom = margin * -1
        let percent = bottom / (height - this.innerHeight) * 100;
        this.progress.style.height = percent + "%"
        this.percentUpdate(percent);
    }

    scroll = e => {
        const direction = e.deltaY > 0 ? -1 : 1;
        let speed = 30;
        let movement;
        const margin = Number(this.content.style.top.split("px")[0]);
        let {height} = this.content.getBoundingClientRect();
        let bottom = margin * -1
        let top = margin * -1 + this.innerHeight;

        if(direction === -1){
            movement = height - top > speed ? speed * direction : (height - top) * direction;
        } else {
            movement = bottom - speed >= 0 ? speed * direction : bottom;
        }

        this.content.style.top = (margin + movement ) + "px";
        this.scrollProgress(margin + movement);
    }

    scrollClick = () => {
        this.scrollLine.onclick = e => {
            const percent = Math.ceil((e.clientY - this.root.getBoundingClientRect().top) / this.innerHeight * 100);
            const margin = (this.content.getBoundingClientRect().height - this.innerHeight) / 100 * percent;
            this.content.style.top = (-margin) + "px";
            this.content.classList.add("touchScroll");
            setTimeout(() => {
                this.content.classList.remove("touchScroll");
            }, 300);
            this.scrollProgress(-margin);

        }
    }

    percentUpdate = (percent) => {
        if(this.percentElement){
            this.percentElement.innerHTML = Math.ceil(percent) + "%";
        }
    }

    init(settings = {}){
        this.prepare(settings);
        this.scrollClick();
        this.percentElement = settings.percent;
        this.percentUpdate(0);
    }

    scrollBlock(){
        this.root.onwheel = undefined;
    }

    scrollAllow(){
        this.root.onwheel = this.scroll;
    }

    get getRoot(){
        return this.root;
    }
}

const _ManegedElements = {
    roots: [],
    instances: []
};

const _hoverHandle = () => {
    _ManegedElements.instances.forEach((areaUpper, indexUpper) => {
        //разрешаем скролл последней территории из той, на которую навели мышкой
        areaUpper.getRoot.onmouseenter = (e) => {
            //Запрещаем скролл всем остальным областям
            _ManegedElements.instances.forEach( (areaLower, indexLower) => {
                        areaLower.scrollBlock();
                }
            )
            areaUpper.scrollAllow();
        }

        areaUpper.getRoot.onmouseleave = (e) => {
            _ManegedElements.instances[0].scrollAllow();
        }


    })
}
const Scroll = (root, settings) => {
    const area = new _Scroll(root);
    area.init(settings);
    if(settings?.global){
        _ManegedElements.instances = [area, ..._ManegedElements.instances];
        _ManegedElements.roots = [area.getRoot, ..._ManegedElements.roots];
    }
    _ManegedElements.instances.push(area);
    _ManegedElements.roots.push(area.getRoot);
    _hoverHandle();
}


