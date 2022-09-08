class Block {
    constructor(params) {
        // Elements
        this.parent = params.parent
        this.element = null
        // Data
        this.size = params.size
        this.color = params.color || "black"
        this.position = params.position || { x: 0, y: 0 }
        this.collidable = params.collidable !== undefined ?  params.collidable : true
        // Initial actions
        if (params.autoCreate !== false) {
            this.create()
        }
    }

    create() {
        this.element = document.createElement("div")
        this.element.className = "g-box"
        this.element.style.height = `${this.size}px`
        this.element.style.width = `${this.size}px`
        this.element.style.left = `${this.position.x}px`
        this.element.style.top = `${this.position.y}px`
        this.element.style.backgroundColor = this.color
        this.parent.append(this.element)
    }

    updatePosition(new_position) {
        for (const key in new_position) {
            this.position[key] = new_position[key]
        }
        this.element.style.left = `${this.position.x}px`
        this.element.style.top = `${this.position.y}px`
    }

    remove() {
        this.element.remove()
    }
}

class Picture extends Block {
    constructor(params) {
        params.autoCreate = false
        super(params)
        this.url = params.url
        console.log("url", this.url)
        this.create()
    }

    create() {
        this.element = document.createElement("img")
        this.element.src = this.url
        this.element.className = "g-image"
        this.element.style.height = `${this.size}px`
        this.element.style.width = `${this.size}px`
        this.element.style.left = `${this.position.x}px`
        this.element.style.top = `${this.position.y}px`
        this.parent.append(this.element)
    }
}

class Sprite {
    constructor(params) {
        // Elements
        this.element = params.element
        this.element.element.classList.add("g-sprite")
        // Data
        this.size = this.element.size
        this.position = this.element.position
        this.velocity = { x: 0, y: 0 }
        this.acceleration = { x: 0, y: 0 }
    }

    updatePosition(new_position) {
        this.element.updatePosition(new_position)
    }

    
}