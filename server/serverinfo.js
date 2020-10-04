const v = require('./v');
var router = v.m.express.Router();

router.get("/basicinfo", (req, res) => {
    res.json({
        name: v.cfg.name,
        players: `${v.userTotal}/${v.cfg.playerLimit}`, //replace 0 with v.userTotal!!!
		location: v.cfg.location,
		uptime: Date.now() - v.startDate, //replace 0 with v.startDate!!!
    });
});

module.exports = router;