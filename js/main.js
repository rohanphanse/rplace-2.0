document.addEventListener("DOMContentLoaded", () => {
    const stage = document.getElementById("stage")
    const colorPicker = document.getElementById("color-picker")
    const regionInput = document.getElementById("region-input")
    const regionOutline = document.getElementById("region-outline")
    const saveButton = document.getElementById("save-button")
    const game = new Game({
        stage,
        height: 500,
        width: 1000,
        elements: {
            colorPicker
        }
    })
    const sprite = new Sprite({
        element: new Picture({
            parent: stage,
            size: 50,
            position: { x: 100, y: 100 },
            url: "/images/palypython.png"
        })
    })
    game.sprites.push(sprite)
    game.start()
    saveButton.addEventListener("click", () => {
        console.log(game.grid)
        game.save()
        console.log(localStorage.getItem("grid"))
    })
    regionInput.addEventListener("input", () => {
        if (regionInput.value.length && isFinite(regionInput.value)) {
            const number = Math.round(+regionInput.value) - 1
            if (number >= 0 && number <= 49) {
                const row = Math.floor(number / 10)
                const column = number % 10
                regionOutline.style.left = `${100 * column}px`
                regionOutline.style.top = `${100 * row}px`
                regionOutline.style.border = "2px solid #66ff00"
                game.region = number
                console.log(game.region)
            }
        } else {
            game.region = "all"
            regionOutline.style.border = "2px solid transparent"
        }
    })
})
