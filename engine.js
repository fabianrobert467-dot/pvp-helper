const RocoEngine = {
    analyzeMechanics: function(pet) {
        let advice = [];
        let threats = [];
        const skills = pet.skills || [];
        skills.forEach(s => {
            const d = s.desc || "";
            if (d.includes("删除") && d.includes("PP")) threats.push(s.name + ": 删PP");
            if (d.includes("恐惧") || d.includes("冰冻")) threats.push(s.name + ": 强控");
            if (d.includes("提升") || d.includes("攻击+")) advice.push(s.name + ": 强化");
            if (d.includes("恢复")) advice.push(s.name + ": 续航");
        });
        return { advice: [...new Set(advice)], threats: [...new Set(threats)] };
    },

    getStrategy: function(myPet, enPet) {
        const ms = myPet.stats.speed;
        const es = enPet.stats.speed;
        let moveOrder = ms > es ? `⚡ 我方先手速度优势 (${ms} vs ${es})` : `🐢 对方先手速度优势 (${es} vs ${ms})`;
        return { moveOrder, shouldSwitch: "否" };
    },

    simulateWinRate: function(myPet, enPet) {
        let wr = 50;
        // 属性克制逻辑
        if (typeof ROCO_CONFIG !== 'undefined' && ROCO_CONFIG.getMultiplier) {
            const m = ROCO_CONFIG.getMultiplier(myPet.element.replace('系',''), enPet.element.replace('系',''));
            wr += (m - 1) * 30;
        }
        // 种族值逻辑
        wr += (myPet.stats.speed - enPet.stats.speed) * 0.1;
        return Math.min(95, Math.max(5, Math.round(wr)));
    }
};
