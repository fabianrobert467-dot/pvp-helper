const RocoEngine = {
    calculateLive: function(my, en, myHp, enHp) {
        let winRate = 50;
        
        // 1. 属性克制计算 (核心影响)
        const myAtkMult = ROCO_CONFIG.getMult(my.element, en.element);
        const enAtkMult = ROCO_CONFIG.getMult(en.element, my.element);
        winRate += (myAtkMult - enAtkMult) * 30; // 克制差直接影响30%权重

        // 2. 种族值潜力 (满血状态下的基础战力)
        const myPower = (Number(my.stats.speed) * 1.2) + (Math.max(Number(my.stats.atk), Number(my.stats.sp_atk)));
        const enPower = (Number(en.stats.speed) * 1.2) + (Math.max(Number(en.stats.atk), Number(en.stats.sp_atk)));
        winRate += (myPower - enPower) / 10;

        // 3. 实时血量动态修正
        // 血量优势方获得额外权重，残血方胜率大幅下降
        const hpBonus = (myHp - enHp) * 0.4;
        winRate += hpBonus;

        // 4. 技能机制扫描
        let threats = [], advice = [];
        const mySkills = JSON.stringify(my.skills);
        const enSkills = JSON.stringify(en.skills);

        if (enAtkMult >= 2) threats.push(`❌ 属性被绝对克制 (x${enAtkMult})`);
        if (myAtkMult >= 2) advice.push(`🔥 属性绝对克制 (x${myAtkMult})`);
        
        if (enSkills.includes("必先") || enSkills.includes("先手+")) {
            if (myHp < 30) threats.push("🚨 危险！对方有先手补刀技能");
        }
        
        if (enHp < 35 && mySkills.includes("斩杀")) {
            advice.push("🎯 对方已进入斩杀线，尝试收割");
        }

        if (!mySkills.includes("防控") && !mySkills.includes("免疫")) {
            advice.push("🛡️ 注意补开防控，防止异常断节奏");
        }

        return {
            pct: Math.min(99, Math.max(1, Math.round(winRate))),
            myAtkMult,
            enAtkMult,
            threats,
            advice
        };
    }
};
