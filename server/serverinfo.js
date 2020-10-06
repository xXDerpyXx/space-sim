const v = require('./v');
var router = v.m.express.Router();

function basicInfo() {
    return {
        name: v.cfg.name,
        players: `${v.userTotal}/${v.cfg.playerLimit}`,
		location: v.cfg.location,
		uptime: Date.now() - v.startDate,
    };
}

router.get("/basicinfo", (req, res) => {
    res.json(basicInfo());
});

router.get("/detailedinfo", (req, res) => {
    res.json(Object.assign(basicInfo(), {
        fuelMax: v.cfg.fuel.max
    }));
});

module.exports = router;