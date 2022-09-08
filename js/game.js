class Game {
    constructor(params) {
        // Elements
        this.stage = params.stage
        this.colorPicker = params.elements.colorPicker
        this.sprites = []
        // Data
        this.height = params.height
        this.width = params.width
        this.blockSize = params.blockSize || 10
        this.stagePosition = { x: null, y: null }
        this.mouse = { x: null, y: null }
        this.grid = createGrid(this.height / this.blockSize, 
                               this.width / this.blockSize)
        this.region = "all"
        this.regionSize = 100
        // State
        this.mouseDown = false
        this.keysDown = {}
        this.canPrint = true
        // Initial actions
        this.create()
        this.addListeners()
    }

    create() {
        // Stage
        this.stage.className = "g-stage"
        this.stage.style.height = `${this.height}px`
        this.stage.style.width = `${this.width}px`
        this.setStagePosition()
        // Grid lines
        this.createGridLines()
        // Populate grid from local storage
        this.populateGrid()
        console.log("Initial grid", this.grid)
    }

    addListeners() {
        this.mouseMoveListener = ["mousemove", (event) => {
            // Using DOM coordinate system
            // Right and down are positive directions
            // Top left corner is (0, 0)
            this.mouse = {
                x: event.clientX - this.stagePosition.x,
                y: event.clientY - this.stagePosition.y
            }
        }]
        this.mouseDownListener = ["mousedown", () => {
            this.mouseDown = true
        }]
        this.mouseUpListener = ["mouseup", () => {
            this.mouseDown = false
        }]
        this.windowResizeListener = ["resize", () => {
            this.setStagePosition()
        }]
        this.keyDownListener = ["keydown", (event) => {
            this.keysDown[event.key] = true
        }]
        this.keyUpListener = ["keyup", (event) => {
            if (this.keysDown.hasOwnProperty(event.key)) {
                delete this.keysDown[event.key]
            }
        }]
        // Add event listeners
        document.addEventListener(...this.mouseMoveListener)
        document.addEventListener(...this.mouseDownListener)
        document.addEventListener(...this.mouseUpListener)
        window.addEventListener(...this.windowResizeListener)
        document.addEventListener(...this.keyDownListener)
        document.addEventListener(...this.keyUpListener)
    }

    setStagePosition() {
        const rect = this.stage.getBoundingClientRect()
        this.stagePosition = {
            x: rect.x,
            y: rect.y
        }
    }

    createGridLines() {
        const regionSize = 100
        // Vertical lines
        for (let x = this.blockSize; x < this.width; x += this.blockSize) {
            if (x % regionSize === 0) {
                continue
            }
            const line = document.createElement("div")
            line.className = "g-grid-line"
            line.style.height = `${this.height}px`
            line.style.width = "1px"
            line.style.left = `${x}px`
            this.stage.append(line)
        }
        // Horizontal lines
        for (let y = this.blockSize; y < this.height; y += this.blockSize) {
            if (y % regionSize === 0) {
                continue
            }
            const line = document.createElement("div")
            line.className = "g-grid-line"
            line.style.height = "1px"
            line.style.width = `${this.width}px`
            line.style.top = `${y}px`
            this.stage.append(line)
        }
        // Vertical region lines
        for (let x = regionSize; x < this.width; x += regionSize) {
            const line = document.createElement("div")
            line.className = "g-grid-line"
            line.style.height = `${this.height}px`
            line.style.width = "1px"
            line.style.left = `${x}px`
            line.style.backgroundColor = "black"
            this.stage.append(line)
        }
        // Horizontal region lines
        for (let y = regionSize; y < this.height; y += regionSize) {
            const line = document.createElement("div")
            line.className = "g-grid-line"
            line.style.height = `1px`
            line.style.width = `${this.width}px`
            line.style.top = `${y}px`
            line.style.backgroundColor = "black"
            this.stage.append(line)
        }
    }

    
    placeElement(element, position) {
        // Round position to nearest block
        const x = Math.round((position.x - element.size / 2) / this.blockSize) * this.blockSize
        const y = Math.round((position.y - element.size / 2) / this.blockSize) * this.blockSize
        const y_index = y / this.blockSize
        const x_index = x / this.blockSize
        // Position is in stage
        if (x >= 0 && x <= this.width - element.size && y >= 0 && y <= this.height - element.size && this.withinRegion(x_index, y_index)) {
            element.position = { x, y }
            element.create()
            if (this.grid[y_index][x_index] === null) {
                this.grid[y_index][x_index] = element
            } else {
                const oldElement = this.grid[y_index][x_index]
                // Remove old element from DOM
                oldElement.remove()
                this.grid[y_index][x_index] = element
            }
        }
    }

    withinRegion(x_index, y_index) {
        let row;
        let column;
        if (isFinite(this.region)) {
            row = Math.floor(this.region / 10)
            column = this.region % 10
        }
        return this.region === "all" || (
            y_index >= 10 * row &&
            y_index < 10 * row + 10 &&
            x_index >= 10 * column &&
            x_index < 10 * column + 10
        )
    }

    start() {
        this.frame = () => {
            if (this.mouseDown) {
                const block = new Block({
                    size: this.blockSize,
                    parent: this.stage,
                    color: this.colorPicker.value,
                    autoCreate: false,
                    collidable: false,
                })
                this.placeElement(block, this.mouse)
            }
            if (this.keysDown["c"]) {
                const backgroundBlock = new Block({
                    size: this.blockSize,
                    parent: this.stage,
                    color: this.colorPicker.value,
                    autoCreate: false,
                    collidable: true
                })
                this.placeElement(backgroundBlock, this.mouse)
            }
            if (this.keysDown["x"]) {
                this.removeElement(this.mouse)
            }
            if (this.canPrint && this.keysDown["p"]) {
                console.log("Grid:", this.grid)
                this.canPrint = false
                setTimeout(() => this.canPrint = true, 200)
            }
            for (const sprite of this.sprites) {
                this.moveSprite(sprite)
            }
            requestAnimationFrame(this.frame)
        }
        requestAnimationFrame(this.frame)
    }

    removeElement(position) {
        const x = Math.round((position.x - this.blockSize / 2) / this.blockSize) * this.blockSize
        const y = Math.round((position.y - this.blockSize / 2) / this.blockSize) * this.blockSize
        const y_index = y / this.blockSize
        const x_index = x / this.blockSize
        let element;
        try {
            element = this.grid[y_index][x_index] || null
        } catch (error) {
            element = null
        }
        if (element !== null && x >= 0 && x <= this.width - element.size && y >= 0 && y <= this.height - element.size) {
            const block = this.grid[y_index][x_index]
            block.remove()
            this.grid[y_index][x_index] = null
        }
    }

    moveSprite(sprite) {
        const move = 4
        const new_position = { x: sprite.position.x, y: sprite.position.y }
        if (this.keysDown["ArrowUp"] || this.keysDown["w"]) {
            new_position.y -= move
        }
        if (this.keysDown["ArrowDown"] || this.keysDown["s"]) {
            new_position.y += move
        }
        if (this.keysDown["ArrowLeft"] || this.keysDown["a"]) {
            new_position.x -= move
        }
        if (this.keysDown["ArrowRight"] || this.keysDown["d"]) {
            new_position.x += move
        }
        if (new_position.x < 0) {
            new_position.x = 0
        }
        if (new_position.x > this.width - sprite.size) {
            new_position.x = this.width - sprite.size
        }
        if (new_position.y < 0) {
            new_position.y = 0
        }
        if (new_position.y > this.height - sprite.size) {
            new_position.y = this.height - sprite.size
        }
        // const size = this.blockSize
        // const x = Math.round((new_position.x) / size) * size
        // const y = Math.round((new_position.y) / size) * size
        // const y_index = y / this.blockSize
        // const x_index = x / this.blockSize
        // for (let i = -1; i <= 1; i++) {
        //     for (let j = -1; j <= 1; j++) {
        //         try {
        //             const block = this.grid[y_index + j][x_index + i]
        //             if (block && block.collidable && checkCollision({
        //                 position: new_position,
        //                 size: sprite.size
        //             }, block)) {
        //                 return
        //             }
        //         } catch (error) {
        //             // console.log(error)
        //         }
        //     }
        // }
        sprite.updatePosition(new_position)
    }

    save() {
        let gridObject = createGrid(this.height / this.blockSize, this.width / this.blockSize)
        for (let r = 0; r < this.grid.length; r++) {
            for (let c = 0; c < this.grid[r].length; c++) {
                if (this.grid[r][c] !== null) {
                    gridObject[r][c] = this.grid[r][c].color
                }
            }
        }
        localStorage.setItem("grid", JSON.stringify(gridObject))
    }

    populateGrid() {
        const gridString = localStorage.getItem("grid")
        if (gridString === null) {
            return
        }
        const grid = JSON.parse(gridString)
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c] !== null) {
                    const block = new Block({
                        size: this.blockSize,
                        parent: this.stage,
                        position: { x: c * this.blockSize, y: r * this.blockSize },
                        color: grid[r][c],
                        collidable: false,
                    })
                    this.grid[r][c] = block
                }
            }
        }
    }
}

function createGrid(rows, columns) {
    const grid = []
    for (let r = 0; r < rows; r++) {
        grid.push([])
        for (let c = 0; c < columns; c++) {
            grid[r][c] = null
        }
    }
    return grid
}

function checkCollision(rect1, rect2) {
    return (rect1.position.x < rect2.position.x + rect2.size &&
            rect1.position.x + rect1.size > rect2.position.x &&
            rect1.position.y < rect2.position.y + rect2.size &&
            rect1.size + rect1.position.y > rect2.position.y)
}
