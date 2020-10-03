const toToggle = [
    'info',
    'throttle',
    'throttleDisplay',
    'map',
    'mapDisplayChecks',
    'chat',
    'pauseButton'
];

var hidden = false;

function toggleUI() {
    hidden = !hidden;
    for (let i of toToggle)
        document.getElementById(i).style.display = (hidden ? 'none' : null);
}

export default toggleUI;