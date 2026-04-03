/**
 * 洛克 PVP 核心模拟计算引擎 V3.1
 */
const RocoEngine = {
    // 机制扫描器
    analyzeMechanics: function(pet) {
        let advice = [];
        let threats = [];
        const skills = pet.skills || [];

        skills.forEach(s => {
            const d = s.desc || "";
            // 扫描关键词
            if (d.includes("提升") || d.includes("攻击+")) advice.push(`${s.name}: 强化增益`);
            if (d.includes("恢复") || d.includes("治疗")) advice.push(`${s.name}: 核心续航`);
            if (d.includes("必先") || parseInt(s.priority) >= 4) {
                advice.push(`${s.name}: 顶级先手`);
                threats.push(`${s.name}: 极速威胁`);
            }
            if (d.includes("删除") && d.includes("PP")) threats.push(`${s.name}: 删PP机制`);
            if (d.includes("恐惧") || d.includes("冰冻") || d.includes("催眠")) threats.push(`${s.name}: 强力控制`);
            if (d.includes("换下") || d.includes("接力")) threats.push(`${s.name}: 状态传递`);
        });

        // 去重
        return { 
            advice: [...new Set(advice)], 
            threats: [...new Set(threats)] 
        };
    },

    // 战术策略生成器
    getStrategy: function(myPet, enPet) {
        const ms = myPet.stats.speed;
        const es = enPet.stats.speed;
        let moveOrder = "";

        if (ms > es) {
            moveOrder = `⚡ 我方速度线占优 (${ms} vs ${es})。首发建议：开启防控或进行首轮强攻。`;
        } else if (ms < es) {
            moveOrder = `🐢 对方拥有先手优势 (${es} vs ${ms})。首发建议：使用必先技能或反伤技能。`;
        } else {
            moveOrder = `⚖️ 速度完全对等，首发博弈取决于技能先手度。`;
        }

        let shouldSwitch = "暂无威胁";
        if (typeof ROCO_CONFIG !== 'undefined') {
            const mult = ROCO_CONFIG.getMultiplier(myPet.element.replace('系',''), enPet.element.replace('系',''));
            if (mult < 1) shouldSwitch = "属性被动，建议切换";
            if (mult > 1) shouldSwitch = "优势对抗，无需换宠";
        }

        return { moveOrder, shouldSwitch };
    },

    // 胜率模拟算法
    simulateWinRate: function(myPet, enPet) {
        let base = 50;
        
        // 1. 属性修正 ($multiplier$)
        if (typeof ROCO_CONFIG !== 'undefined') {
            const m = ROCO_CONFIG.getMultiplier(myPet.element.replace('系',''), enPet.element.replace('系',''));
            base += (m - 1) * 35; 
        }

        // 2. 种族值面板修正
        const myPower = Math.max(myPet.stats.atk, myPet.stats.sp_atk);
        const enBulk = (enPet.stats.def + enPet.stats.sp_def) / 2;
        base += (myPower - enBulk) * 0.15;

        // 3. 速度压制修正
        base += (myPet.stats.speed - enPet.stats.speed) * 0.08;

        return Math.min(99, Math.max(1, Math.round(base)));
    }
};
